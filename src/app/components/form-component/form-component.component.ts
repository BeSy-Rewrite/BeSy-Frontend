import {
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  Input,
  OnChanges,
  output,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInput, MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatTableDataSource } from '@angular/material/table';
import { MatTooltip } from '@angular/material/tooltip';
import { environment } from '../../../environments/environment';
import { GenericTableComponent } from '../generic-table/generic-table.component';

export interface FieldOption {
  label: string;
  value: any;
}

export interface FormField {
  name: string;
  label: string;
  type:
    | 'text'
    | 'radio'
    | 'select'
    | 'number'
    | 'checkbox'
    | 'date'
    | 'email'
    | 'tel'
    | 'search'
    | 'table'
    | 'textarea'
    | 'autocomplete';

  /** Whether the field is required to be filled */
  required: boolean;

  /**
   * Default value when rendering the field.
   * For select/radio/autocomplete this may be either the raw option value or a whole option ({ label, value }).
   */
  defaultValue?: any;

  /** Dropdown options for select or autocomplete fields from which the user can choose from */
  options?: FieldOption[];

  /** Optional validators for the form control, e.g. Validators.required or custom validators */
  validators?: any[];

  /** Whether changes to this field should be emitted as signals for real-time reactions in the UI */
  emitAsSignal?: boolean;

  loadFromApi?: boolean;
  nominatim_param?: string;
  nominatim_field?: string;

  /** Defines if the field should be disabled in edit mode (if editable is false) or remain enabled (if editable is true or undefined) */
  editable?: boolean;

  /** Used to add additional information about the expected field input */
  tooltip?: string;

  /** For autocomplete fields: whether the options should be filterable based on user input */
  filterable?: boolean;

  /** For autocomplete fields: whether the field requires a selection from the options list (true) or the user can provide any input (false) */
  requireSelection?: boolean;
}

export interface FormConfig {
  title?: string;
  subtitle?: string;
  fields: FormField[];
}

/** Checks whether a value has the shape of an option ({ label, value }). */
function isOption(value: unknown): value is FieldOption {
  return typeof value === 'object' && value !== null && 'label' in value && 'value' in value;
}

@Component({
  selector: 'app-form-component',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatInput,
    MatDividerModule,
    MatTooltip,
    GenericTableComponent,
    MatIconModule,
    MatCheckboxModule,
    MatAutocompleteModule,
    MatDatepickerModule,
  ],
  templateUrl: './form-component.component.html',
  styleUrls: ['./form-component.component.scss'],
})
export class FormComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly environment = environment;

  config = input.required<FormConfig>();
  @Input() formGroup!: FormGroup;
  @Input() editMode?: boolean;

  // Data source for the table
  @Input() tableDataSource: MatTableDataSource<unknown> = new MatTableDataSource<unknown>([]);

  // Columns to be displayed in the table
  @Input() tableColumns: { id: string; label: string }[] = [];

  // Trigger to refresh the form controls (e.g. when options are loaded from API or the config changes)
  @Input() refreshTrigger?: any;

  // Signal emitted when a form field with emitAsSignal=true changes its value
  valueChanged = output<{ field: string; value: any }>();
  // Signal emitted when a search field triggers the search action
  searchEvent = output<string>();

  // Filtered options for autocomplete fields
  filteredOptions: { [fieldName: string]: FieldOption[] } = {};
  @ViewChildren('autoInput') autoInputs!: QueryList<ElementRef<HTMLInputElement>>;

  /** Controls whose valueChanges subscription has already been set up (prevents duplicate subscriptions). */
  private readonly wiredControls = new WeakSet<AbstractControl>();

  /** Last applied defaultValue per control (by reference), so each default is applied only once. */
  private readonly appliedDefaults = new WeakMap<AbstractControl, unknown>();

  /** Runs on the first binding and on every input change (including config signal updates). */
  ngOnChanges(): void {
    this.updateFormControls();
  }

  protected compareValues = (a: any, b: any) =>
    a === b || (a != null && b != null && JSON.stringify(a) === JSON.stringify(b));

  // display function for autocomplete to show label instead of object
  displayFn = (val: any) => {
    if (!val) return '';
    return typeof val === 'object' ? val.label : val;
  };

  onAutocompleteInput(field: FormField, value: string) {
    if (value == null) return;
    if (field.filterable) this.filterOptions(field, value);
  }

  emitSearch(fieldName: string) {
    const query = this.formGroup.get(fieldName)?.value ?? '';
    this.searchEvent.emit(typeof query === 'string' ? query.trim() : '');
  }

  // ---------------------------------------------------------------------------
  // Control setup
  // ---------------------------------------------------------------------------

  private updateFormControls(): void {
    if (!this.formGroup) return;

    for (const field of this.config().fields) {
      const control = this.ensureControl(field);

      if (field.type === 'autocomplete' && field.options) {
        this.filteredOptions[field.name] = field.options.slice();
      }

      this.wireValueChanges(field.name, control);
      this.applyDefaultValue(field, control);
    }

    if (this.editMode) {
      this.editModeDisableFields();
    }
  }

  /** Creates the control once; existing controls (and user input) are kept. */
  private ensureControl(field: FormField): AbstractControl {
    if (!this.formGroup.contains(field.name)) {
      this.formGroup.addControl(field.name, this.fb.control(null, field.validators ?? []));
    }
    return this.formGroup.get(field.name)!;
  }

  /** Subscribes exactly once per control. Reads the current field config on each emission. */
  private wireValueChanges(fieldName: string, control: AbstractControl): void {
    if (this.wiredControls.has(control)) return;
    this.wiredControls.add(control);

    control.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(value => {
      // Options and flags may have been patched since subscribing, so look up the current field
      const field = this.findField(fieldName);
      if (!field) return;

      if (field.type === 'autocomplete' && field.filterable) {
        this.filterOptions(field, value);
      }
      if (field.emitAsSignal) {
        this.valueChanged.emit({ field: fieldName, value });
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Default values
  // ---------------------------------------------------------------------------

  /**
   * Applies `field.defaultValue` to the control, also for controls that already exist.
   * - Each default (by reference) is applied only once.
   * - User input (dirty controls) is never overwritten.
   * - If options are not loaded yet, it is retried on the next config update.
   */
  private applyDefaultValue(field: FormField, control: AbstractControl): void {
    const defaultValue = field.defaultValue;

    if (defaultValue === undefined) return;
    if (this.appliedDefaults.get(control) === defaultValue) return;
    if (control.dirty) return;

    const value = this.resolveDefaultValue(field, defaultValue);
    if (value === undefined) return; // e.g. options not loaded yet -> retry later

    control.setValue(value, { emitEvent: false });
    this.appliedDefaults.set(control, defaultValue);
  }

  /** Converts the default into the value the control expects for the given field type. */
  private resolveDefaultValue(field: FormField, defaultValue: unknown): unknown {
    if (defaultValue === null) return null;

    // Accept both the raw value and a whole option ({ label, value })
    const raw = isOption(defaultValue) ? defaultValue.value : defaultValue;

    switch (field.type) {
      case 'select':
      case 'radio':
        // mat-select / mat-radio-group bind to opt.value
        return this.findOption(field, raw)?.value;

      case 'autocomplete': {
        // mat-autocomplete binds to the whole option object
        const match = this.findOption(field, raw);
        if (match) return match;
        // Options not loaded yet: an option-shaped default can be shown directly via displayFn
        if (isOption(defaultValue)) return defaultValue;
        // Free-text autocomplete may accept plain strings
        return !field.requireSelection && typeof defaultValue === 'string'
          ? defaultValue
          : undefined;
      }

      default:
        return defaultValue;
    }
  }

  private findOption(field: FormField, raw: unknown): FieldOption | undefined {
    return field.options?.find(opt => this.compareValues(opt.value, raw));
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  private findField(name: string): FormField | undefined {
    return this.config().fields.find(field => field.name === name);
  }

  private filterOptions(field: FormField, value: any) {
    let filterValue = '';

    if (typeof value === 'string') {
      // User is typing
      filterValue = value.toLowerCase();
    } else if (value && typeof value === 'object' && typeof value.label === 'string') {
      // User has already selected an option
      filterValue = value.label.toLowerCase();
    }

    this.filteredOptions[field.name] = (field.options ?? []).filter(opt =>
      opt.label.toLowerCase().includes(filterValue)
    );
  }

  private editModeDisableFields() {
    for (const field of this.config().fields) {
      const control = this.formGroup.get(field.name);
      if (!field.editable && control?.enabled) {
        // emitEvent: false prevents valueChanges emissions on every config update
        control.disable({ emitEvent: false });
      }
    }
  }
}
