import { Component, Input, OnInit, output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from "@angular/material/datepicker";
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
  | 'textarea';
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
    MatDatepickerModule
  ],
  templateUrl: './form-component.component.html',
  styleUrls: ['./form-component.component.scss'],
})
export class FormComponent implements OnInit {
  constructor(private readonly fb: FormBuilder) { }

  @Input() config!: FormConfig;
  @Input() formGroup!: FormGroup;
  @Input() editMode?: boolean;

  // Data source for the address table
  @Input() tableDataSource: MatTableDataSource<CustomerIdResponseDTO> =
    new MatTableDataSource<CustomerIdResponseDTO>([]);

  // Columns to be displayed in the address table
  @Input() tableColumns: { id: string; label: string }[] = [];

  valueChanged = output<{ field: string; value: any }>();

  ngOnInit() {
    this.config.fields.forEach((field) => {
      this.formGroup.addControl(
        field.name,
        this.fb.control(field.defaultValue, field.validators || [])
      );
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
}
