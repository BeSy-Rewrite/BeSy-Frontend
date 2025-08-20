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
import { AddressesService } from '../../api2_0/services/AddressesService';
import { SuppliersService } from '../../api2_0/services/SuppliersService';
import { PersonsService } from '../../api2_0/services/PersonsService';
import { OrdersService } from '../../api2_0/services/OrdersService';
import type { ItemRequestDTO } from '../../api2_0/models/ItemRequestDTO';
import type { QuotationRequestDTO } from '../../api2_0/models/QuotationRequestDTO';
import { CostCentersService } from '../../api2_0/services/CostCentersService';
import type { AddressRequestDTO } from '../../api2_0/models/AddressRequestDTO';
import type { SupplierRequestDTO } from '../../api2_0/models/SupplierRequestDTO';
import type { PersonRequestDTO } from '../../api2_0/models/PersonRequestDTO';
import type { OrderRequestDTO } from '../../api2_0/models/OrderRequestDTO';
import type { CostCenterRequestDTO } from '../../api2_0/models/CostCenterRequestDTO';
import { MatDividerModule } from '@angular/material/divider';
import { firstValueFrom } from 'rxjs';
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

// Form page configuration interface
// This interface defines the structure of the form page configuration
export interface FormPageConfig {
  title: string; // The title of the form page
  fields: FormFieldConfig[]; // The fields to be displayed on the form, as defined by FormFieldConfig
  apiEndpoint: string; // The API endpoint for form submission
  successMessage?: string; // The message to display on successful form submission
  editMode?: boolean; // Flag to indicate if the form is in edit mode
  initialData?: any; // Initial data to populate the form in edit mode
  // Optional parent order id for nested submissions (e.g., items, quotations)
  parentOrderId?: number;
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
  isShaking = false;

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
    this.setDefaultValues(); // Set default values based on entity type
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

  // Patch form values with initial data
  private patchFormValues(data: any): void {
    this.form.patchValue(data);

    // Handle special cases for edit mode - disable ID fields
    // This ensures that the ID field is not editable when editing an existing record
    // ToDo: Change this to show the ID in the title or a read-only field
    if (this.editMode()) {
      const idFieldMap: { [endpoint: string]: string } = {
        addresses: 'id',
        suppliers: 'id',
        persons: 'id',
        orders: 'id',
        cost_centers: 'cost_center_id',
        customer_id: 'customer_id',
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
    this.formGroupDirective.resetForm();
    this.form.reset();
    this.setDefaultValues(); // Reset to default values when going back
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
          addresses: 'id',
          suppliers: 'id',
          persons: 'id',
          orders: 'id',
          cost_centers: 'cost_center_id',
          customer_id: 'customer_id',
        };

        const idField = idFieldMap[this.config().apiEndpoint];
        if (idField && this.form.get(idField)) {
          this.form.get(idField)?.enable();
          formData = this.form.value;
        }
      }

      // Choose between service-based create and HTTP PUT (edit) based on edit mode
      if (this.editMode()) {
        // ToDo: Switch to api2_0 service update methods once available (currently not all PUT endpoints are implemented)
        const request = this.http.put(
          this.URL +
            this.config().apiEndpoint +
            '/' +
            this.getEditId(formData),
          JSON.stringify(formData),
          { headers }
        );

        request.subscribe({
          next: () => this.handleSubmitSuccess(formData, true),
          error: (error) => this.handleSubmitError(error),
        });
      } else {
        // Create mode: route to api2_0 services
        const endpoint = this.config().apiEndpoint;
        const requestBody = formData;
        let promise: Promise<any> | undefined;

        switch (endpoint) {
          case 'addresses':
            promise = AddressesService.createAddress(requestBody as AddressRequestDTO) as unknown as Promise<any>;
            break;
          case 'suppliers':
            promise = SuppliersService.createSupplier(requestBody as SupplierRequestDTO) as unknown as Promise<any>;
            break;
          case 'persons':
            promise = PersonsService.createPerson(requestBody as PersonRequestDTO) as unknown as Promise<any>;
            break;
          case 'orders':
            promise = OrdersService.createOrder(requestBody as OrderRequestDTO) as unknown as Promise<any>;
            break;
          case 'items': {
            const parentId = this.config().parentOrderId;
            if (parentId == null) {
              return this.handleSubmitError(new Error('Parent order ID is required to create items.'));
            }
            const itemDto: ItemRequestDTO = requestBody as ItemRequestDTO;
            promise = OrdersService.createOrderItems(parentId, [itemDto]) as unknown as Promise<any>;
            break;
          }
          case 'quotations': {
            const parentId = this.config().parentOrderId;
            if (parentId == null) {
              return this.handleSubmitError(new Error('Parent order ID is required to create quotations.'));
            }
            const quotationDto: QuotationRequestDTO = requestBody as QuotationRequestDTO;
            promise = OrdersService.createOrderQuotations(parentId, [quotationDto]) as unknown as Promise<any>;
            break;
          }
          case 'cost_centers':
            promise = CostCentersService.createCostCenter(requestBody as CostCenterRequestDTO) as unknown as Promise<any>;
            break;
          default:
            // Fallback to raw HTTP POST if no service is available.
            // ToDo: remove when api is final
            promise = firstValueFrom(
              this.http.post(this.URL + endpoint, JSON.stringify(requestBody), { headers })
            );
        }

        promise
          ?.then(() => this.handleSubmitSuccess(formData, false))
          .catch((error) => this.handleSubmitError(error));
      }
    } else {
      this.form.markAllAsTouched();
      this._notifications.open('Benötigte Werte nicht komplett', undefined, { duration: 3000 });
      this.isShaking = true;
      setTimeout(() => {
        this.isShaking = false;
      }, 1000);
    }
  }


  // Get the ID of the entity being edited
  private getEditId(formData: any): string {

    // The ID fields for each entity type, used in the put-request url
    const idFieldMap: { [endpoint: string]: string } = {
      addresses: 'id',
      suppliers: 'id',
      persons: 'id',
      orders: 'id',
      cost_centers: 'cost_center_id',
      customer_id: 'customer_id',
    };

    const idField = idFieldMap[this.config().apiEndpoint];
    return idField
      ? formData[idField]
      : formData.id || formData[Object.keys(formData)[0]];
  }

  private handleSubmitSuccess(formData: any, isEdit: boolean): void {
    this._notifications.open(this.config().successMessage || 'Erfolgreich gespeichert', undefined, { duration: 3000 });
    this.formSubmitted.emit(formData);

    if (!isEdit) {
      this.formGroupDirective.resetForm();
      this.form.reset();
      this.setDefaultValues();
    }
  }

  private handleSubmitError(error: any): void {
    console.error('There was an error!', error);
    this._notifications.open('Fehler beim Speichern ', undefined, { duration: 3000 });

    if (this.editMode()) {
      const idFieldMap: { [endpoint: string]: string } = {
        addresses: 'id',
        suppliers: 'id',
        persons: 'id',
        orders: 'id',
        cost_centers: 'cost_center_id',
        customer_id: 'customer_id',
      };

      const idField = idFieldMap[this.config().apiEndpoint];
      if (idField && this.form.get(idField)) {
        this.form.get(idField)?.disable();
      }
    }
  }

  private setDefaultValues(): void {
    // Set default values after form reset based on entity type
    switch (this.config().apiEndpoint) {
      case 'addresses':
        this.form.patchValue({
          country: 'Deutschland',
        });
        break;
      case 'suppliers':
        this.form.patchValue({
          country: 'Deutschland',
          flag_preferred: false,
        });
        break;
      // Add other default values as needed
    }
  }
}
