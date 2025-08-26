import { Component, Input, OnInit, output, Signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInput, MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableDataSource } from '@angular/material/table';
import { AddressResponseDTO } from '../../api';
import { GenericTableComponent } from '../generic-table/generic-table.component';

export interface AddressField {
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
    | 'table';
  required: boolean;
  defaultValue?: any;
  options?: { label: string; value: any }[];
  nominatim_param?: string;
  nominatim_field?: string;
  validators?: any[];
  emitAsSignal?: boolean;
}

export interface AddressConfig {
  title: string;
  editSubtitle?: string;
  newAddressSubtitle?: string;
  fields: AddressField[];
}

@Component({
  selector: 'app-address-form',
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
    GenericTableComponent,
  ],
  templateUrl: './address-form.component.html',
  styleUrl: './address-form.component.css',
})
export class AddressFormComponent implements OnInit {
  constructor(private fb: FormBuilder) {}

  // Fields to be rendered in the address form
  @Input() config!: AddressConfig;

  // Form group for the address form, can be pre-filled
  @Input() formGroup!: FormGroup;

  // Data source for the address table
  @Input() tableDataSource: MatTableDataSource<AddressResponseDTO> =
    new MatTableDataSource<AddressResponseDTO>([]);

  // Columns to be displayed in the address table
  @Input() tableColumns: { id: string; label: string }[] = [];

  // Emits value changes from the form fields to the parent component
  valueChanged = output<{ field: string; value: any }>();

  addressSelected = output<number>();

  selectedAddressId: number | null = null;

  ngOnInit() {

    // Initialize form controls based on the config
    this.config.fields.forEach((field) => {
      this.formGroup.addControl(
        field.name,
        this.fb.control(field.defaultValue, field.validators || [])
      );

      // Emit value changes as signals if configured as such in the config
      if (field.emitAsSignal) {
        const control = this.formGroup.get(field.name);
        control?.valueChanges.subscribe((val) => {
          this.valueChanged.emit({ field: field.name, value: val });
        });
      }
    });

    // As addressMode is an optional field, we need to check if it exists
    const addressModeControl = this.formGroup.get('addressMode');

    if (addressModeControl) {

      // Emit initial value to the component above
      this.valueChanged.emit({
        field: 'addressMode',
        value: addressModeControl.value,
      });

      // Set initial readonly state
      this.setFieldsReadonly(addressModeControl.value === 'existing');

      // Track changes to the address mode and allow/deny editing of the form fields
      addressModeControl.valueChanges.subscribe((mode) => {
        if (mode === 'existing') {
          this.setFieldsReadonly(true);
        } else {
          this.setFieldsReadonly(false);
        }
      });
    }
  }

  /**
   * Handles the row click event and patches the form with the selected row data.
   * @param event - The row click event containing the selected row data.
   */
  onRowClickedPatchForm(event: any) {
    // Handle the row click event and patch the form with the selected row data
    this.formGroup.patchValue(event);

    this.selectedAddressId = event.id;
    this.addressSelected.emit(event.id);
  }

  /**
   * Toggles the readonly state of the form fields.
   * @param readonly - Whether the fields should be readonly.
   */
  private setFieldsReadonly(readonly: boolean): void {
    // alle Controls außer addressMode sperren/freigeben
    Object.keys(this.formGroup.controls).forEach((key) => {
      if (key !== 'addressMode') {
        if (readonly) {
          this.formGroup.get(key)?.disable();
        } else {
          this.formGroup.get(key)?.enable();
        }
      }
    });
  }
}
