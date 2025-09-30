import {
  Component,
  ElementRef,
  Input,
  OnInit,
  output,
  QueryList,
  Signal,
  ViewChildren,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInput, MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltip } from '@angular/material/tooltip';
import { MatTableDataSource } from '@angular/material/table';
import { CustomerIdResponseDTO } from '../../api';
import { GenericTableComponent } from '../generic-table/generic-table.component';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

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
  title: string;
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
  ],
  templateUrl: './form-component.component.html',
  styleUrls: ['./form-component.component.scss'],
})
export class FormComponent implements OnInit {
  constructor(private fb: FormBuilder) {}

  @Input() config!: FormConfig;
  @Input() formGroup!: FormGroup;
  @Input() editMode?: boolean;

  // Data source for the address table
  @Input() tableDataSource: MatTableDataSource<CustomerIdResponseDTO> =
    new MatTableDataSource<CustomerIdResponseDTO>([]);

  // Columns to be displayed in the address table
  @Input() tableColumns: { id: string; label: string }[] = [];

  valueChanged = output<{ field: string; value: any }>();

  filteredOptions: { [fieldName: string]: { label: string; value: any }[] } =
    {};
  @ViewChildren('autoInput') autoInputs!: QueryList<
    ElementRef<HTMLInputElement>
  >;

  ngOnInit() {
    this.config.fields.forEach((field) => {
      this.formGroup.addControl(
        field.name,
        this.fb.control(field.defaultValue, field.validators || [])
      );

      // Initial Filter setzen
      if (field.type === 'autocomplete' && field.options) {
        this.filteredOptions[field.name] = field.options.slice();

        // Wenn filterbar → bei ValueChanges neu filtern
        if (field.filterable) {
          this.formGroup.get(field.name)!.valueChanges.subscribe((val) => {
            this.filterOptions(field, val);
          });
        }
      }
      if (field.emitAsSignal) {
        const control = this.formGroup.get(field.name);
        control?.valueChanges.subscribe((val) => {
          this.valueChanged.emit({ field: field.name, value: val });
        });
      }
    });

    if (this.editMode) {
      this.editModeDisableFields();
    }
  }

  private editModeDisableFields() {
    this.config.fields.forEach((field) => {
      if (!field.editable) {
        this.formGroup.get(field.name)?.disable();
      }
    });
  }

  onAutocompleteInput(field: FormField, value: string) {
    if (value == null) return
    if (field.filterable) this.filterOptions(field, value);
  }

  private filterOptions(field: FormField, value: string) {
    const filterValue = (value ?? '').toLowerCase();
    this.filteredOptions[field.name] = (field.options ?? []).filter((opt) =>
      opt.label.toLowerCase().includes(filterValue)
    );
  }

  // displayWith: zeigt das Label für einen gespeicherten value an
  displayFn = (val: any) => {
    if (val == null) return '';
    for (const f of this.config.fields) {
      if (f.type === 'autocomplete' && f.options) {
        const found = f.options.find((o) => o.value === val);
        if (found) return found.label;
      }
    }
    return val;
  };
}
