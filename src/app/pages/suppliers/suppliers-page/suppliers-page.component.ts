import { Component, OnInit, signal, ViewChild, WritableSignal } from '@angular/core';
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
} from '../../../api-services-v2';
import { FormComponent } from '../../../components/form-component/form-component.component';
import { GenericTableComponent } from '../../../components/generic-table/generic-table.component';
import { ADDRESS_FORM_CONFIG } from '../../../configs/create-address-config';
import { CUSTOMER_ID_FORM_CONFIG } from '../../../configs/create-customer-id-config';
import {
  NOMINATIM_SEARCH_CONFIG,
  SUPPLIER_FORM_CONFIG,
} from '../../../configs/supplier/supplier-config';
import { ButtonColor, TableActionButton } from '../../../models/generic-table';
import { NominatimMappedAddress, NominatimService } from '../../../services/nominatim.service';
import { SuppliersWrapperService } from '../../../services/wrapper-services/suppliers-wrapper.service';

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

  addressIsSelected: WritableSignal<boolean> = signal(false);
  customerIDs = signal<CustomerIdRequestDTO[]>([]);
  customerIDsTableDataSource = new MatTableDataSource<CustomerIdRequestDTO>([]);
  customerIDsTableColumns = [
    { id: 'customer_id', label: 'Kundennummer' },
    { id: 'comment', label: 'Kommentar' },
  ];
  customerIDsTableActions: TableActionButton[] = [
    {
      id: 'delete',
      label: 'Löschen',
      buttonType: 'filled',
      color: ButtonColor.WARN,
      action: (row: CustomerIdRequestDTO) => {
        this.onDeleteCustomerID(row);
      },
    },
  ];

  constructor(
    private readonly router: Router,
    private readonly _notifications: MatSnackBar,
    private readonly suppliersWrapperService: SuppliersWrapperService,
    private readonly nominatimService: NominatimService
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
  }

  private async loadInitialData(): Promise<void> {
    // Load initial data for the supplier table
    const suppliers = await this.suppliersWrapperService.getAllSuppliers();
    this.suppliersDataSource = new MatTableDataSource<SupplierResponseDTO>(suppliers);
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

      // Check if a supplier with the same name already exists --> the backend will throw an error

      const supplierExists = await this.suppliersWrapperService.checkIfSupplierExists(
        supplierFormValue.name
      );
      if (supplierExists) {
        this._notifications.open(
          'Ein Lieferant mit diesem Namen existiert bereits. Bitte bearbeiten sie den entsprechenden Lieferanten oder wählen sie einen anderen Namen aus.',
          undefined,
          {
            duration: 5000,
          }
        );
        return;
      }

      try {
        // create Supplier
        const response = await this.suppliersWrapperService.createSupplier({
          ...supplierFormValue,
          address: addressFormValue,
        });

        // If there are customer IDs to create, create them
        if (this.customerIDs().length > 0 && response.id) {
          for (const customerIdData of this.customerIDs()) {
            await this.suppliersWrapperService.createSupplierCustomerId(
              response.id,
              customerIdData
            );
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
    this.customerIdForm.reset();
    this.nominatimAddressFormGroup.reset();
    this.addressIsSelected.set(false);
    this.tabGroup.selectedIndex = 0; // Switch to tab index for "Lieferantenübersicht"
  }

  onAddCustomerID() {
    if (this.customerIdForm.invalid) {
      this._notifications.open('Bitte alle Pflichtfelder ausfüllen', undefined, { duration: 3000 });
      return;
    }

    const customerIdFormValue = this.customerIdForm.value as CustomerIdRequestDTO;

    // Check if customer ID already exists in the table
    if (
      this.customerIDs()
        .map(item => item.customer_id)
        .includes(customerIdFormValue.customer_id)
    ) {
      this._notifications.open('Diese Kundennummer wurde bereits hinzugefügt', undefined, {
        duration: 3000,
      });
      return;
    }

    // Add new customer ID to the signal and update the table data source
    this.customerIDs.update(current => [...current, customerIdFormValue]);
    this.customerIDsTableDataSource.data = this.customerIDs();
    this.customerIdForm.reset();
  }

  onDeleteCustomerID(row: CustomerIdRequestDTO) {
    this.customerIDs.update(current =>
      current.filter(item => item.customer_id !== row.customer_id || item.comment !== row.comment)
    );
    this.customerIDsTableDataSource.data = this.customerIDs();
  }

  onSearch(query: string) {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    this.nominatimService.throttledSearch(trimmedQuery).subscribe(results => {
      this.nominatimTableDataSource().data = results;
    });
  }

  onAddressInTableSelected(event: NominatimMappedAddress | null) {
    if (!event) {
      this.addressIsSelected.set(false);
      this.addressFormGroup.reset();
      return;
    }
    // Set selected state first to render form
    this.addressIsSelected.set(true);
    // Defer patch until form controls are created
    setTimeout(() => {
      this.addressFormGroup.patchValue(event);
    });
  }

  onAddressModeChange(event: MatButtonToggleChange): void {
    this.addressMode.set(event.value);
    this.addressFormGroup.reset();
  }
}
