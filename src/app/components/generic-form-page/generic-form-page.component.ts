import {
  Component,
  EventEmitter,
  Input,
  Output,
  Inject,
  OnInit,
  ViewChild,
  input,
  effect,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormGroupDirective,
  Validators,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CommonModule } from '@angular/common';
import {
  MAT_SNACK_BAR_DEFAULT_OPTIONS,
  MatSnackBarModule,
} from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { environment } from '../../../environments/environment';

export interface FormFieldConfig {
  name: string; // Form control name
  label: string; // Display label
  type: 'text' | 'select' | 'date' | 'number' | 'email' | 'tel';
  required: boolean;
  options?: any[]; // For select fields
  optionValue?: string; // Property name for option value
  optionLabel?: string; // Property name for option display
  placeholder?: string;
  validators?: any[];
}

export interface FormPageConfig {
  title: string;
  fields: FormFieldConfig[];
  apiEndpoint: string;
  successMessage?: string;
  editMode?: boolean;
  initialData?: any;
}

@Component({
  selector: 'app-generic-form-page',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatSnackBarModule,
    MatGridListModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './generic-form-page.component.html',
  styleUrls: ['./generic-form-page.component.css'],
})
export class GenericFormPageComponent implements OnInit {
  @ViewChild(FormGroupDirective) formGroupDirective!: FormGroupDirective;

  config = input.required<FormPageConfig>();
  editMode = input<boolean>(false);
  initialData = input<any>(null);
  @Output() formSubmitted = new EventEmitter<any>();
  @Output() formCancelled = new EventEmitter<void>();
  @Output() backClicked = new EventEmitter<void>();

  form!: FormGroup;
  dropdownData: { [key: string]: any[] } = {};

  private URL = environment.apiUrl;

  constructor(private http: HttpClient, private _notifications: MatSnackBar) {
    // Watch for changes in initialData and patch form when data becomes available
    effect(() => {
      const data = this.initialData();
      if (this.editMode() && data && this.form) {
        this.patchFormValues(data);
      }
    });
  }

  ngOnInit(): void {
    this.buildForm();
    this.loadDropdownData();

    // Initial data patching is now handled by the effect in constructor
    // This ensures it works even when data loads asynchronously
    const data = this.initialData();
    if (this.editMode() && data) {
      this.patchFormValues(data);
    }
  }

  // Build the form controls based on the configuration
  // This method creates form controls dynamically based on the config provided
  // It sets up validators and initializes the form group
  private buildForm(): void {
    const formControls: { [key: string]: FormControl } = {};

    this.config().fields.forEach((field) => {
      const validators = [];
      if (field.required) {
        validators.push(Validators.required);
      }
      if (field.validators) {
        validators.push(...field.validators);
      }

      formControls[field.name] = new FormControl('', validators);
    });

    this.form = new FormGroup(formControls);
  }

  // Load dropdown data for select fields
  // This method fetches data for select fields either from static options or from API endpoints
  private loadDropdownData(): void {
    const selectFields = this.config().fields.filter(
      (field) => field.type === 'select'
    );

    selectFields.forEach((field) => {
      if (field.options) {
        // Static options provided
        this.dropdownData[field.name] = field.options;
      } else {
        // Load from API based on field name
        this.loadDropdownFromAPI(field.name);
      }
    });
  }

  // Load dropdown data from API based on field name
  // This method maps field names to API endpoints and fetches the data
  private loadDropdownFromAPI(fieldName: string): void {
    // Map field names to API endpoints
    const apiEndpoints: { [key: string]: string } = {
      faculty_abbr: 'faculties',
      address_name: 'addresses',
      country_name: 'countries',
      address_type: 'address-types',
      supplier_name: 'suppliers',
      vat_value: 'vats',
      preferred_list_abbr: 'preferred_lists',
    };

    // Fetch data from the corresponding API endpoint
    // If the field name matches an endpoint, make an HTTP GET request to fetch the data
    const endpoint = apiEndpoints[fieldName];
    if (endpoint) {
      this.http.get<any[]>(`${this.URL}${endpoint}`).subscribe((data) => {
        this.dropdownData[fieldName] = data;
      });
    }
  }

  // Check if the form is in edit mode
  private patchFormValues(data: any): void {
    this.form.patchValue(data);

    // Handle special cases for edit mode - disable ID fields
    // This ensures that the ID field is not editable when editing an existing record
    // ToDo: Change this to show the ID in the title or a read-only field
    if (this.editMode()) {
      const idFieldMap: { [endpoint: string]: string } = {
        'addresses': 'name',
        'suppliers': 'id',
        'persons': 'id',
        'orders': 'id',
        'cost_centers': 'cost_center_id',
        'customer_id': 'customer_id'
      };

      const idField = idFieldMap[this.config().apiEndpoint];
      if (idField && this.form.get(idField)) {
        this.form.get(idField)?.disable();
      }
    }
  }

  isFieldValid(fieldName: string): boolean {
    const control = this.form.get(fieldName);
    return control ? control.invalid && control.touched : false;
  }

  getFieldError(fieldName: string): string {
    const control = this.form.get(fieldName);
    if (control?.errors?.['required']) {
      return 'Wert benötigt';
    }
    return '';
  }

  onBack(): void {
    this.backClicked.emit();
  }

  onCancel(): void {
    this.form.reset();
    this.formCancelled.emit();
  }

  onSubmit(): void {
    if (this.form.valid) {
      const headers = { 'content-type': 'application/json' };
      let formData = this.form.value;

      // Re-enable disabled fields for submission
      if (this.editMode()) {
        const idFieldMap: { [endpoint: string]: string } = {
          'addresses': 'name',
          'suppliers': 'id',
          'persons': 'id',
          'orders': 'id',
          'cost_centers': 'cost_center_id',
          'customer_id': 'customer_id'
        };

        const idField = idFieldMap[this.config().apiEndpoint];
        if (idField && this.form.get(idField)) {
          this.form.get(idField)?.enable();
          formData = this.form.value;
        }
      }

      // Choose between POST (create) and PUT (update) based on edit mode
      const request = this.editMode()
        ? this.http.put(
            this.URL + this.config().apiEndpoint + '/' + this.getEditId(formData),
            JSON.stringify(formData),
            { headers }
          )
        : this.http.post(
            this.URL + this.config().apiEndpoint,
            JSON.stringify(formData),
            { headers }
          );

      request.subscribe({
        next: (data) => {
          this._notifications.open(
            this.config().successMessage || 'Erfolgreich gespeichert'
          );
          this.formSubmitted.emit(formData);

          // Reset form after successful submission (for create mode)
          if (!this.editMode()) {
            this.formGroupDirective.resetForm();
            this.form.reset();
            this.setDefaultValues();
          }
        },
        error: (error) => {
          console.error('There was an error!', error);
          this._notifications.open('Fehler beim Speichern ');

          // Re-disable field if there was an error
          if (this.editMode()) {
            const idFieldMap: { [endpoint: string]: string } = {
              'addresses': 'name',
              'suppliers': 'id',
              'persons': 'id',
              'orders': 'id',
              'cost_centers': 'cost_center_id',
              'customer_id': 'customer_id'
            };

            const idField = idFieldMap[this.config().apiEndpoint];
            if (idField && this.form.get(idField)) {
              this.form.get(idField)?.disable();
            }
          }
        },
      });
    } else {
      this.form.markAllAsTouched();
      this._notifications.open('Benötigte Werte nicht komplett');
    }
  }

  private getEditId(formData: any): string {
    // Map entity types to their ID fields
    const idFieldMap: { [endpoint: string]: string } = {
      'addresses': 'name',
      'suppliers': 'id',
      'persons': 'id',
      'orders': 'id',
      'cost_centers': 'cost_center_id',
      'customer_id': 'customer_id'
    };

    const idField = idFieldMap[this.config().apiEndpoint];
    return idField ? formData[idField] : formData.id || formData[Object.keys(formData)[0]];
  }

  private setDefaultValues(): void {
    // Set default values after form reset based on entity type
    switch (this.config().apiEndpoint) {
      case 'addresses':
        this.form.patchValue({
          country: 'Germany'
        });
        break;
      case 'suppliers':
        this.form.patchValue({
          country: 'Germany',
          flag_preferred: false
        });
        break;
      // Add other default values as needed
    }
  }
}
