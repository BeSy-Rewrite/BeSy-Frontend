import {
  Component,
  ElementRef,
  Input,
  OnInit,
  output,
  QueryList,
  SimpleChanges,
  ViewChildren,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

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
import { CustomerIdResponseDTO } from '../../api-services-v2';
import { GenericTableComponent } from '../generic-table/generic-table.component';

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

  required: boolean;
  defaultValue?: any;
  options?: { label: string; value: any }[];
  validators?: any[];
  emitAsSignal?: boolean;
  loadFromApi?: boolean;
  nominatim_param?: string;
  nominatim_field?: string;
  editable?: boolean;
  tooltip?: string;
  filterable?: boolean; // For autocomplete fields: whether the options should be filterable based on user input
  requireSelection?: boolean;
}

export interface FormConfig {
  title?: string;
  subtitle?: string;
  fields: FormField[];
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
export class FormComponent implements OnInit {
  constructor(private readonly fb: FormBuilder) {}

  @Input() config!: FormConfig;
  @Input() formGroup!: FormGroup;
  @Input() editMode?: boolean;

  // Data source for the address table
  @Input() tableDataSource: MatTableDataSource<CustomerIdResponseDTO> =
    new MatTableDataSource<CustomerIdResponseDTO>([]);

  // Columns to be displayed in the address table
  @Input() tableColumns: { id: string; label: string }[] = [];

  // Trigger to refresh the form controls (e.g. when options are loaded from API or the config changes)
  @Input() refreshTrigger?: any;

  // Signal emitted when a form field with emitAsSignal=true changes its value
  valueChanged = output<{ field: string; value: any }>();
  // Signal emitted when a search field triggers the search action
  searchEvent = output<string>();

  // Filtered options for autocomplete fields
  filteredOptions: { [fieldName: string]: { label: string; value: any }[] } = {};
  @ViewChildren('autoInput') autoInputs!: QueryList<ElementRef<HTMLInputElement>>;

  ngOnInit() {
    this.updateFormControls();
  }

  private editModeDisableFields() {
    this.config.fields.forEach(field => {
      if (!field.editable) {
        this.formGroup.get(field.name)?.disable();
      }
    });
  }

  onAutocompleteInput(field: FormField, value: string) {
    if (value == null) return;
    if (field.filterable) this.filterOptions(field, value);
  }

  private filterOptions(field: FormField, value: any) {
    let filterValue = '';

    if (typeof value === 'string') {
      // Benutzer tippt selbst
      filterValue = value.toLowerCase();
    } else if (value && typeof value === 'object' && typeof value.label === 'string') {
      // Benutzer hat bereits ein Objekt ausgewählt
      filterValue = value.label.toLowerCase();
    }

    this.filteredOptions[field.name] = (field.options ?? []).filter(opt =>
      opt.label.toLowerCase().includes(filterValue)
    );
  }

  // display function for autocomplete to show label instead of object
  displayFn = (val: any) => {
    if (!val) return '';
    return typeof val === 'object' ? val.label : val;
  };

  ngOnChanges(changes: SimpleChanges) {
    if (changes['refreshTrigger']) {
      this.updateFormControls();
    }
  }

  emitSearch(fieldName: string) {
    const query = this.formGroup.get(fieldName)?.value ?? '';
    this.searchEvent.emit(typeof query === 'string' ? query.trim() : '');
  }

  private updateFormControls() {
    this.config.fields.forEach(field => {
      // If the control already exists, do not overwrite it (to preserve user input)
      if (!this.formGroup.get(field.name)) {
        this.formGroup.addControl(
          field.name,
          this.fb.control(field.defaultValue, field.validators || [])
        );
      }

      // Handle Autocomplete fields
      if (field.type === 'autocomplete' && field.options) {
        this.filteredOptions[field.name] = field.options.slice();

        const control = this.formGroup.get(field.name);

        // Set default value if it's an object and matches one of the options
        if (field.defaultValue && field.options?.length > 0) {
          const match = field.options.find(opt => opt.value === field.defaultValue.value) || null;

          // Set the control value to the matching option object
          if (match) {
            control?.setValue(match, { emitEvent: false });
          }
        }

        // Handle filtering for Autocomplete fields
        if (field.filterable) {
          control?.valueChanges.subscribe(val => {
            this.filterOptions(field, val);
          });
        }
      }

      // Handle Select fields
      if (field.type === 'select' && field.options) {
        const control = this.formGroup.get(field.name);

        // Set default value if it matches one of the options
        if (field.defaultValue && field.options?.length > 0) {
          const match = field.options.find(opt => opt.value === field.defaultValue) || null;

          // Set the control value to the matching option value
          if (match) {
            control?.setValue(match.value, { emitEvent: false });
          }
        }
      }

      if (field.type === 'radio' && field.options) {
        const control = this.formGroup.get(field.name);

        // Set default value if it matches one of the options
        if (field.defaultValue && field.options?.length > 0) {
          const match = field.options.find(opt => opt.value === field.defaultValue) || null;

          // Set the control value to the matching option value
          if (match) {
            control?.setValue(match.value, { emitEvent: false });
          }
        }
      }

      // Emit value changes as signals if configured as such in the config
      if (field.emitAsSignal) {
        const control = this.formGroup.get(field.name);
        control?.valueChanges.subscribe(val => {
          this.valueChanged.emit({ field: field.name, value: val });
        });
      }
    });

    // Disable non-editable fields in edit mode
    if (this.editMode) {
      this.editModeDisableFields();
    }
  }
}
