import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { AddressRequestDTO, AddressResponseDTO, CustomerIdRequestDTO, SupplierRequestDTO, SupplierResponseDTO } from '../../../apiv2';
import { AddressFormComponent } from '../../../components/address-form/address-form.component';
import { FormComponent } from '../../../components/form-component/form-component.component';
import { GenericTableComponent } from '../../../components/generic-table/generic-table.component';
import { ADDRESS_FORM_CONFIG } from '../../../configs/create-address-config';
import { CUSTOMER_ID_FORM_CONFIG } from '../../../configs/create-customer-id-config';
import { SUPPLIER_FORM_CONFIG } from '../../../configs/create-supplier-config';
import { ButtonColor, TableActionButton } from '../../../models/generic-table';
import { SuppliersWrapperService } from '../../../services/wrapper-services/suppliers-wrapper.service';
import { VatWrapperService } from '../../../services/wrapper-services/vats-wrapper.service';
import { VatResponseDTO } from './../../../api/models/VatResponseDTO';

@Component({
  selector: 'app-suppliers-page',
  imports: [
    MatTabGroup,
    MatDivider,
    MatTab,
    GenericTableComponent,
    FormComponent,
    AddressFormComponent,
    MatButtonModule,
  ],
  templateUrl: './suppliers-page.component.html',
  styleUrl: './suppliers-page.component.scss',
})
export class SuppliersPageComponent implements OnInit {
  constructor(private readonly router: Router,
    private readonly _notifications: MatSnackBar,
    private readonly suppliersService: SuppliersWrapperService,
    private readonly vatService: VatWrapperService
  ) { }

  // ! ID of the selected address in the table. Keep default undefinded!
  selectedAddressId: number | undefined = undefined;

  @ViewChild('tabGroup') tabGroup!: MatTabGroup;

  // Button actions for the table
  actions: TableActionButton[] = [
    {
      id: 'edit',
      label: 'Edit',
      buttonType: 'elevated',
      color: ButtonColor.PRIMARY,
      action: (row: SupplierResponseDTO) => this.editSupplier(row),
    },
    {
      id: 'delete',
      label: 'Delete',
      buttonType: 'filled',
      color: ButtonColor.WARN,
      action: (row: SupplierResponseDTO) => {
        this.deleteSupplier(row);
      },
    },
    {
      id: 'view',
      label: 'View',
      buttonType: 'text',
      color: ButtonColor.ACCENT,
      action: (row: SupplierResponseDTO) => this.viewSupplier(row),
    },
  ];

  // Data source to be displayed in the supplier-table component
  suppliersDataSource: MatTableDataSource<SupplierResponseDTO> =
    new MatTableDataSource<SupplierResponseDTO>([]);
  // Columns to be displayed in the supplier-table component
  suppliersTableColumns = [
    { id: 'id', label: 'ID' },
    { id: 'name', label: 'Lieferant' },
    { id: 'email', label: 'E-Mail' },
    { id: 'phone', label: 'Telefonnummer' },
    { id: 'website', label: 'Website' },
  ];

  // Data source to be displayed in the address-table component
  addressTableDataSource: MatTableDataSource<AddressResponseDTO> =
    new MatTableDataSource<AddressResponseDTO>([]);

  // Columns to be displayed in the address-table component
  addressTableColumns = [
    { id: 'id', label: 'ID' },
    { id: 'street', label: 'Straße' },
    { id: 'town', label: 'Stadt' },
    { id: 'postal_code', label: 'Postleitzahl' },
    { id: 'country', label: 'Land' },
  ];

  // Form configuration for the generic form component
  supplierFormConfig = SUPPLIER_FORM_CONFIG;
  addressFormConfig = ADDRESS_FORM_CONFIG;
  customerIdFormConfig = CUSTOMER_ID_FORM_CONFIG;

  supplierForm = new FormGroup({});
  addressForm = new FormGroup({});
  customerIdForm = new FormGroup({});

  // * To track whether the user wants to use an existing address or create a new one
  // * Used to decide which form to display & which API endpoint to call in which order
  addressMode: string | undefined = undefined;

  ngOnInit() {
    // Load initial data for the supplier table
    this.suppliersService.getAllSuppliers().subscribe(suppliers => {
      this.suppliersDataSource = new MatTableDataSource<SupplierResponseDTO>(suppliers);
    });

    // Load initial data for the address table
    this.suppliersService.getSuppliersAddresses().subscribe(addresses => {
      this.addressTableDataSource = new MatTableDataSource<AddressResponseDTO>(
        addresses
      );
    });

    // Load initial data for the VAT options field in the form
    this.vatService.getAllVats().subscribe(vatOptions => {
      this.setDropdownOptions(vatOptions);
    });
  }

  // * Handle edit action
  editSupplier(row: SupplierResponseDTO) {
    this.router.navigate(['/suppliers/', row.id, 'edit']);
  }

  // ToDo: Implement delete logic
  deleteSupplier(_row: SupplierResponseDTO) {
    // Implement delete logic here
  }

  // ToDo: Implement view logic
  viewSupplier(row: SupplierResponseDTO) {
    this.router.navigate(['/suppliers/', row.id, 'view']);
  }

  // Signals to be handled coming from the supplier-form-component
  onFormValueChanged(_event: { field: string; value: any; }) {
    /* if (event.field === 'addressMode') {
      this.addressMode = event.value;
    } */
  }

  // Signals to be handled coming from the address-form-component
  onAddressFormValueChanged(event: { field: string; value: any; }) {
    // Handle address form value changes if needed
    if (event.field === 'addressMode') {
      this.addressMode = event.value;
    }
  }

  // * Handle form submission
  async onSubmit() {
    // Check if both forms are valid
    if (this.supplierForm.valid && this.addressForm.valid) {
      // Both forms are valid, check the address mode to determine whether to use an existing address or create a new one
      const supplierFormValue = this.supplierForm.value as SupplierRequestDTO;
      const addressFormValue =
        this.addressForm.getRawValue() as AddressRequestDTO;
      const customerIdValue = this.customerIdForm.value as CustomerIdRequestDTO;

      // Remove addressMode and existingAddresses from the addressFormValue before sending to the API,
      // as typescript is not able to to match form fields only to their matching counterpart
      // For whatever reason, the api-request completely ignores the AddressRequestDTO and sends whatever is in the form
      if ('addressMode' in addressFormValue) {
        delete addressFormValue.addressMode;
      }

      if ('existingAddresses' in addressFormValue) {
        delete addressFormValue.existingAddresses;
      }

      // create Supplier
      this.suppliersService.createSupplier({
        ...supplierFormValue,
        address: addressFormValue,
      }).subscribe({
        next: response => {
          // create Customer-Id if customer_id field is not empty and supplier-create response is valid
          if (customerIdValue.customer_id?.trim() && response.id !== undefined) {
            this.suppliersService.createSupplierCustomerId(response.id, {
              ...customerIdValue,
            }).subscribe({
              error: () => {
                this._notifications.open(
                  'Fehler beim Erstellen der Kundennummer',
                  undefined,
                  { duration: 3000 }
                );
              }
            });
          }
          // Show success notification
          this._notifications.open('Lieferant erfolgreich erstellt', undefined, {
            duration: 3000,
          });
        },
        error: () => {
          // Show error notification
          this._notifications.open(
            'Fehler beim Erstellen des Lieferanten',
            undefined,
            { duration: 3000 }
          );
        }
      });
    } else {
      // Handle form errors
      this.supplierForm.markAllAsTouched();
      this.addressForm.markAllAsTouched();
      this._notifications.open(
        'Bitte überprüfen Sie die Eingaben im Formular',
        undefined,
        { duration: 3000 }
      );
    }
  }

  // * Handle back navigation
  onBack() {
    this.supplierForm.reset();
    this.addressForm.reset();
    this.tabGroup.selectedIndex = 0; // Switch to tab index for "Lieferantenübersicht"
    this.addressMode = 'new';
  }

  // * Catch emitted event from address-form-component
  // * Update selectedAddressId with the selected address ID
  onAddressSelected($event: number) {
    this.selectedAddressId = $event;
  }

  // Set dropdown options for the form fields
  setDropdownOptions(vatOptions: VatResponseDTO[]) {
    // set options for dropdown fields
    this.supplierFormConfig.fields.find(
      (field) => field.name === 'vat_id'
    )!.options = vatOptions.map((vat) => ({
      value: vat.value,
      label: `${vat.description} (${vat.value}%)`,
    }));
  }
}
