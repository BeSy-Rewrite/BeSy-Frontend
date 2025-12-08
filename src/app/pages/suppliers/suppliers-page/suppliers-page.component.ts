import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MatButtonToggle,
  MatButtonToggleChange,
  MatButtonToggleGroup,
} from '@angular/material/button-toggle';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { Router } from '@angular/router';
import {
  AddressRequestDTO,
  CustomerIdRequestDTO,
  SupplierRequestDTO,
  SupplierResponseDTO,
  VatResponseDTO,
} from '../../../api-services-v2';
import { FormComponent } from '../../../components/form-component/form-component.component';
import { GenericTableComponent } from '../../../components/generic-table/generic-table.component';
import { ADDRESS_FORM_CONFIG } from '../../../configs/create-address-config';
import { CUSTOMER_ID_FORM_CONFIG } from '../../../configs/create-customer-id-config';
import { SUPPLIER_FORM_CONFIG } from '../../../configs/create-supplier-config';
import { NOMINATIM_SEARCH_CONFIG } from '../../../configs/supplier/supplier-config';
import { ButtonColor, TableActionButton } from '../../../models/generic-table';
import { NominatimMappedAddress, NominatimService } from '../../../services/nominatim.service';
import { SuppliersWrapperService } from '../../../services/wrapper-services/suppliers-wrapper.service';
import { VatWrapperService } from '../../../services/wrapper-services/vats-wrapper.service';

@Component({
  selector: 'app-suppliers-page',
  imports: [
    MatTabGroup,
    MatDivider,
    MatTab,
    GenericTableComponent,
    FormComponent,
    MatButtonModule,
    MatButtonToggleGroup,
    MatButtonToggle,
    MatIcon,
  ],
  templateUrl: './suppliers-page.component.html',
  styleUrl: './suppliers-page.component.scss',
})
export class SuppliersPageComponent implements OnInit {
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

  // Form configuration for the generic form component
  supplierFormConfig = SUPPLIER_FORM_CONFIG;
  addressFormConfig = ADDRESS_FORM_CONFIG;
  customerIdFormConfig = CUSTOMER_ID_FORM_CONFIG;

  supplierFormGroup = new FormGroup({});
  addressFormGroup = new FormGroup({});
  customerIdForm = new FormGroup({});

  addressMode = signal<'new' | 'search'>('search');
  nominatimAddressFormConfig = NOMINATIM_SEARCH_CONFIG;
  nominatimAddressFormGroup = new FormGroup({});
  nominatimResponseTableColumns = [
    { id: 'name', label: 'Bezeichnung' },
    { id: 'street', label: 'Straße' },
    { id: 'building_number', label: 'Hausnummer' },
    { id: 'postal_code', label: 'Postleitzahl' },
    { id: 'town', label: 'Ort' },
    { id: 'country', label: 'Land' },
  ];
  nominatimTableDataSource = signal<MatTableDataSource<NominatimMappedAddress>>(
    new MatTableDataSource<NominatimMappedAddress>([])
  );

  constructor(
    private readonly router: Router,
    private readonly _notifications: MatSnackBar,
    private readonly suppliersWrapperService: SuppliersWrapperService,
    private readonly vatWrapperService: VatWrapperService,
    private readonly nominatimService: NominatimService
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
  }

  private async loadInitialData(): Promise<void> {
    // Load initial data for the supplier table
    const suppliers = await this.suppliersWrapperService.getAllSuppliers();
    this.suppliersDataSource = new MatTableDataSource<SupplierResponseDTO>(suppliers);

    // Load initial data for the VAT options field in the form
    const vatOptions = await this.vatWrapperService.getAllVats();
    this.setDropdownOptions(vatOptions);
  }

  // * Handle edit action
  editSupplier(row: SupplierResponseDTO) {
    this.router.navigate(['/suppliers/', row.id, 'edit']);
  }

  // Placeholder: add delete logic when backend endpoint is ready
  deleteSupplier(row: SupplierResponseDTO) {
    // Implement delete logic here
  }

  // Placeholder: view navigation
  viewSupplier(row: SupplierResponseDTO) {
    this.router.navigate(['/suppliers/', row.id, 'view']);
  }

  // * Handle form submission
  async onSubmit() {
    // Check if both forms are valid
    if (this.supplierFormGroup.valid && this.addressFormGroup.valid) {
      // Both forms are valid, check the address mode to determine whether to use an existing address or create a new one
      const supplierFormValue = this.supplierFormGroup.value as SupplierRequestDTO;
      const addressFormValue = this.addressFormGroup.getRawValue() as AddressRequestDTO;
      const customerIdValue = this.customerIdForm.value as CustomerIdRequestDTO;

      // Check if a supplier with the same name already exists --> the backend will throw an error

      const supplierExists = await this.suppliersWrapperService.checkIfSupplierExists(
        supplierFormValue.name
      );
      if (supplierExists) {
        this._notifications.open('Ein Lieferant mit diesem Namen existiert bereits', undefined, {
          duration: 3000,
        });
        return;
      }

      try {
        // create Supplier
        const response = await this.suppliersWrapperService.createSupplier({
          ...supplierFormValue,
          address: addressFormValue,
        });

        // create Customer-Id if customer_id field is not empty and supplier-create response is valid
        if (customerIdValue.customer_id?.trim() && response.id !== undefined) {
          try {
            await this.suppliersWrapperService.createSupplierCustomerId(response.id, {
              ...customerIdValue,
            });
          } catch (error) {
            console.error('Error creating customer ID:', error);
            this._notifications.open('Fehler beim Erstellen der Kundennummer', undefined, {
              duration: 3000,
            });
          }
        }

        // Show success notification
        this._notifications.open('Lieferant erfolgreich erstellt', undefined, {
          duration: 3000,
        });
      } catch (error) {
        console.error('Error creating supplier:', error);
        this._notifications.open('Fehler beim Erstellen des Lieferanten', undefined, {
          duration: 3000,
        });
      }
    } else {
      // Handle form errors
      this.supplierFormGroup.markAllAsTouched();
      this.addressFormGroup.markAllAsTouched();
      this._notifications.open('Bitte überprüfen Sie die Eingaben im Formular', undefined, {
        duration: 3000,
      });
    }
  }

  // * Handle back navigation
  onBack() {
    this.supplierFormGroup.reset();
    this.addressFormGroup.reset();
    this.tabGroup.selectedIndex = 0; // Switch to tab index for "Lieferantenübersicht"
  }

  // * Catch emitted event from address-form-component
  // * Update selectedAddressId with the selected address ID
  onAddressSelected($event: number) {
    this.selectedAddressId = $event;
  }

  // Set dropdown options for the form fields
  setDropdownOptions(vatOptions: VatResponseDTO[]) {
    // set options for dropdown fields
    this.supplierFormConfig.fields.find(field => field.name === 'vat_id')!.options = vatOptions.map(
      vat => ({
        value: vat.value,
        label: `${vat.description} (${vat.value}%)`,
      })
    );
  }

  onSearch(query: string) {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    this.nominatimService.throttledSearch(trimmedQuery).subscribe(results => {
      this.nominatimTableDataSource().data = results;
    });
  }

  onAddressInTableSelected(event: NominatimMappedAddress) {
    this.addressFormGroup.patchValue(event);
  }

  onAddressModeChange(event: MatButtonToggleChange): void {
    this.addressMode.set(event.value);
    this.addressFormGroup.reset();
  }
}
