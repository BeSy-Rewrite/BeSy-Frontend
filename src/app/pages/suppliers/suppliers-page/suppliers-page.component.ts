import { VatResponseDTO } from './../../../api/models/response-dtos/VatResponseDTO';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { ButtonColor, TableActionButton } from '../../../models/generic-table';
import {
  AddressRequestDTO,
  AddressResponseDTO,
  SupplierRequestDTO,
  SupplierResponseDTO,
  SuppliersService,
} from '../../../api';
import { MatTableDataSource } from '@angular/material/table';
import { SUPPLIER_FORM_CONFIG } from '../../../configs/supplier-config';
import { ADDRESS_FORM_CONFIG } from '../../../configs/address-config';
import { FormGroup } from '@angular/forms';
import { MatDivider } from '@angular/material/divider';
import { GenericTableComponent } from '../../../components/generic-table/generic-table.component';
import { FormComponent } from '../../../components/form-component/form-component.component';
import { AddressFormComponent } from '../../../components/address-form/address-form.component';
import { MatButtonModule } from '@angular/material/button';
import { VatSService } from '../../../api';

@Component({
  selector: 'app-suppliers-page',
  imports: [MatTabGroup, MatDivider, MatTab, GenericTableComponent, FormComponent, AddressFormComponent, MatButtonModule],
  templateUrl: './suppliers-page.component.html',
  styleUrl: './suppliers-page.component.css',
})
export class SuppliersPageComponent implements OnInit {
  constructor(private router: Router, private _notifications: MatSnackBar) {}

  selectedAddressId: number | null = null;

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
  personForm = new FormGroup({});
  addressForm = new FormGroup({});

  // * To track whether the user wants to use an existing address or create a new one
  // * Used to decide which form to display & which API endpoint to call in which order
  addressMode: string | null = null;

  async ngOnInit(): Promise<void> {

    // Load initial data for the supplier table
    const suppliers = await SuppliersService.getAllSuppliers();
    this.suppliersDataSource = new MatTableDataSource<SupplierResponseDTO>(
      suppliers
    );

    // Load initial data for the address table
    const addresses = await SuppliersService.getSuppliersAddresses();
    this.addressTableDataSource = new MatTableDataSource<AddressResponseDTO>(
      addresses
    );

    // Load initial data for the VAT options field in the form
    const vatOptions = await VatSService.getAllVats();
    this.setDropdownOptions(vatOptions);

  }

  editSupplier(row: SupplierResponseDTO) {
    this.router.navigate(['/suppliers/', row.id, 'edit']);
  }

  // ToDo: Implement delete logic here
  deleteSupplier(row: SupplierResponseDTO) {
    // Implement delete logic here
  }

  viewSupplier(row: SupplierResponseDTO) {
    this.router.navigate(['/suppliers/', row.id, 'view']);
  }

  // Signals to be handled coming from the supplier-form-component
  onFormValueChanged(event: { field: string; value: any }) {
    if (event.field === 'addressMode') {
      this.addressMode = event.value;
    }
  }

  // Signals to be handled coming from the address-form-component
  onAddressFormValueChanged(event: { field: string; value: any }) {
    // Handle address form value changes if needed
    if (event.field === 'addressMode') {
      this.addressMode = event.value;
    }
  }

  // * Handle form submission
  async onSubmit() {
    // Check if both forms are valid
    if (this.personForm.valid && this.addressForm.valid) {
      // Both forms are valid, check the address mode to determine whether to use an existing address or create a new one
      const supplierFormValue = this.personForm.value as SupplierRequestDTO;
      const addressFormValue = this.addressForm.value as AddressRequestDTO;
      try {
        const response = await SuppliersService.createSupplier({
          ...supplierFormValue,
          address: addressFormValue
        });
      } catch (error) {
        this._notifications.open(
          'Fehler beim Erstellen des Lieferanten',
          undefined,
          { duration: 3000 }
        );
      }
      this._notifications.open('Lieferant erfolgreich erstellt', undefined, {
        duration: 3000,
      });
    } else {
      // Handle form errors
      this.personForm.markAllAsTouched();
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
    this.tabGroup.selectedIndex = 0; // Switch to tab index for "Personenübersicht"
  }

  // * Catch emitted event from address-form-component
  // * Update selectedAddressId with the selected address ID
  onAddressSelected($event: number) {
    this.selectedAddressId = $event;
  }

  // Set dropdown options for the form fields
  setDropdownOptions(vatOptions: VatResponseDTO[]) {

    // ToDo: Comment out when id-field is implemented
    // set options for dropdown fields
    //this.supplierFormConfig.fields.find(field => field.name === 'vat_id')!.options = vatOptions.map(vat => ({value: vat.id, label: `${vat.description} (${vat.value}%)`}));
  }
}
