import { Location } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MatButtonToggle,
  MatButtonToggleChange,
  MatButtonToggleGroup,
} from '@angular/material/button-toggle';
import { MatDialog } from '@angular/material/dialog';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import {
  AddressRequestDTO,
  AddressResponseDTO,
  CustomerIdRequestDTO,
  CustomerIdResponseDTO,
  SupplierRequestDTO,
  SupplierResponseDTO,
} from '../../../api-services-v2';
import { ConfirmDialogComponent } from '../../../components/confirm-dialog/confirm-dialog.component';
import { FormComponent } from '../../../components/form-component/form-component.component';
import { GenericTableComponent } from '../../../components/generic-table/generic-table.component';
import { EDIT_SUPPLIER_ADDRESS_FORM_CONFIG } from '../../../configs/edit/edit-address-config';
import { EDIT_CUSTOMER_ID_FORM_CONFIG } from '../../../configs/edit/edit-customer-id-config';
import {
  NOMINATIM_SEARCH_CONFIG,
  SUPPLIER_FORM_CONFIG,
} from '../../../configs/supplier/supplier-config';
import { ButtonColor, TableActionButton } from '../../../models/generic-table';
import { EditSupplierResolvedData } from '../../../resolver/edit-supplier.resolver';
import { NominatimMappedAddress, NominatimService } from '../../../services/nominatim.service';
import { SuppliersWrapperService } from '../../../services/wrapper-services/suppliers-wrapper.service';
@Component({
  selector: 'app-edit-suppliers-page',
  imports: [
    MatDivider,
    FormComponent,
    MatButtonModule,
    MatIcon,
    MatButtonToggle,
    MatButtonToggleGroup,
    GenericTableComponent,
  ],
  templateUrl: './edit-suppliers-page.component.html',
  styleUrl: './edit-suppliers-page.component.scss',
})
export class EditSuppliersPageComponent implements OnInit, AfterViewInit {
  constructor(
    private readonly route: ActivatedRoute,
    private readonly _notifications: MatSnackBar,
    private readonly suppliersWrapperService: SuppliersWrapperService,
    private readonly dialog: MatDialog,
    private readonly cdr: ChangeDetectorRef,
    private readonly nominatimService: NominatimService,
    private readonly location: Location,
    private readonly _dialog: MatDialog
  ) {}

  supplierForm = new FormGroup({});
  supplierFormConfig = SUPPLIER_FORM_CONFIG;

  addressFormGroup = new FormGroup({});
  addressFormConfig = EDIT_SUPPLIER_ADDRESS_FORM_CONFIG;

  customerIdForm = new FormGroup({});
  customerIdFormConfig = EDIT_CUSTOMER_ID_FORM_CONFIG;

  addressIsSelected: WritableSignal<boolean> = signal(false);
  customerIDs = signal<CustomerIdResponseDTO[]>([]);
  customerIDsTableDataSource = new MatTableDataSource<CustomerIdResponseDTO>([]);
  customerIDsTableColumns = [
    { id: 'customer_id', label: 'Kundennummer' },
    { id: 'comment', label: 'Kommentar' },
  ];
  customerIDsTableActions: TableActionButton<CustomerIdResponseDTO>[] = [
    {
      id: 'delete',
      label: 'Löschen',
      buttonType: 'filled',
      color: ButtonColor.WARN,
      action: (row: CustomerIdResponseDTO) => this.onDeleteCustomerID(row),
      showCondition: (row: CustomerIdResponseDTO) => !row.supplier_id,
    },
  ];
  supplier: SupplierResponseDTO | undefined = undefined;
  supplierId: number | undefined = undefined;
  supplierName: WritableSignal<string | undefined> = signal(undefined);
  supplierAddress: AddressResponseDTO = {} as AddressResponseDTO;

  addressMode = signal<'existing' | 'search' | 'new'>('existing');

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

  isFirstRender: boolean = true;

  ngOnInit(): void {
    const supplierData = this.route.snapshot.data['supplierData'] as EditSupplierResolvedData;
    this.supplierId = supplierData.supplier.id;
    this.supplierName.set(supplierData.supplier.name);

    this.customerIDs.set(
      (supplierData.customerIds ?? []).map(custId => ({
        supplier_id: this.supplierId,
        customer_id: custId.customer_id,
        comment: custId.comment ?? '',
      }))
    );
    this.customerIDsTableDataSource.data = this.customerIDs();

    this.supplier = supplierData.supplier;
    this.supplierAddress = supplierData.supplierAddress;
  }

  ngAfterViewInit(): void {
    // Ensure change detection runs after view init to avoid ExpressionChangedAfterItHasBeenCheckedError
    this.cdr.detectChanges();

    // Form patchen (jetzt sind Optionen da!)
    this.supplierForm.patchValue({
      ...this.supplier,
    });

    this.addressFormGroup.patchValue(this.supplierAddress);
    this.addressFormGroup.disable();
  }

  /**
   * Handle revert changes action
   */
  onRevertChanges() {
    const dialogRef = this._dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Alle Änderungen zurücksetzen',
        message:
          'Möchten Sie wirklich alle Änderungen zurücksetzen? Alle ungespeicherten Änderungen gehen verloren.',
        confirmButtonText: 'Zurücksetzen',
        cancelButtonText: 'Abbrechen',
      },
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.revertFormChanges();
      }
    });
  }

  /**
   * Revert form changes to the original supplier data loaded
   */
  private revertFormChanges() {
    this.supplierForm.patchValue({
      ...this.supplier,
    });
    this.addressMode.set('existing');
    this.addressFormGroup.patchValue(this.supplierAddress);
    this.addressFormGroup.disable();
    this.customerIDs.set(
      (this.route.snapshot.data['supplierData'] as EditSupplierResolvedData).customerIds?.map(
        custId => ({
          customer_id: custId.customer_id,
          comment: custId.comment ?? '',
        })
      ) ?? []
    );
    this.customerIDsTableDataSource.data = this.customerIDs();
  }

  /**
   * * Handle form submission
   * Opens a confirmation dialog before proceeding with the save operation
   */
  onSubmit() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Änderungen bestätigen',
        message:
          'Hinweis: Die Änderungen der Lieferantendaten sind irreversibel und systemweit für alle Benutzer sichtbar. Sie beeinflussen aber keine bereits getätigten Bestellungen. Möchten Sie fortfahren?',
      },
    });

    dialogRef.afterClosed().subscribe(async confirmed => {
      if (confirmed) {
        this.saveSupplierChanges();
      }
    });

    // Prepare form data for submission
  }

  // * Save supplier and address changes
  async saveSupplierChanges() {
    if (this.supplierForm.invalid || this.addressFormGroup.invalid) {
      this._notifications.open('Bitte alle Pflichtfelder ausfüllen', undefined, { duration: 3000 });
      return;
    }

    let supplierFormValue = this.supplierForm.value as SupplierRequestDTO;

    const addressFormValue = this.addressFormGroup.value as AddressRequestDTO;
    supplierFormValue = {
      ...supplierFormValue,
      address: addressFormValue,
    };

    try {
      // Update supplier data
      await this.suppliersWrapperService.updateSupplier(this.supplierId!, supplierFormValue);
      // Check if address form contains meaningful data (not just defaults/nulls)
      const hasAddressData =
        addressFormValue &&
        (addressFormValue.street ||
          addressFormValue.town ||
          addressFormValue.postal_code ||
          addressFormValue.building_name ||
          addressFormValue.building_number ||
          addressFormValue.county ||
          addressFormValue.comment);

      if (hasAddressData) {
        this.addressMode.set('existing');
        this.addressFormGroup.patchValue(addressFormValue);
        this.addressFormGroup.disable();
      }

      // If a entry in customerIDs has no supplier_id, it is a new entry and needs to be created
      for (const custId of this.customerIDs()) {
        // Only create if supplier_id is not set
        if (!custId.supplier_id) {
          const response = await this.suppliersWrapperService.createSupplierCustomerId(
            this.supplierId!,
            {
              customer_id: custId.customer_id,
              comment: custId.comment ?? '',
            } as CustomerIdRequestDTO
          );

          // Update the local signal with the new supplier_id from the backend
          this.customerIDs.update(current =>
            current.map(item =>
              item.customer_id === response.customer_id
                ? { ...item, supplier_id: this.supplierId }
                : item
            )
          );
          this.customerIDsTableDataSource.data = this.customerIDs();
        }
      }

      this._notifications.open('Lieferant erfolgreich aktualisiert', undefined, { duration: 3000 });
    } catch (error) {
      console.error('Error updating supplier:', error);
      this._notifications.open('Fehler beim Aktualisieren des Lieferanten', undefined, {
        duration: 3000,
      });
    }
  }

  onDeleteCustomerID(row: CustomerIdResponseDTO) {
    // Remove from the displayed table
    this.customerIDs.update(current =>
      current.filter(
        item => !(item.customer_id === row.customer_id && item.comment === row.comment)
      )
    );
    this.customerIDsTableDataSource.data = this.customerIDs();
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
    // Important: Don't add supplier_id for locally-added entries so they can be deleted
    const newCustomerId: CustomerIdResponseDTO = {
      customer_id: customerIdFormValue.customer_id,
      comment: customerIdFormValue.comment,
      // supplier_id is intentionally omitted for local entries
    };

    this.customerIDs.update(current => [...current, newCustomerId]);
    this.customerIDsTableDataSource.data = this.customerIDs();
    this.customerIdForm.reset();
  }

  onAddressModeChange(event: MatButtonToggleChange): void {
    this.addressMode.set(event.value);
    if (event.value === 'existing') {
      this.addressFormGroup.patchValue(this.supplierAddress);
      this.addressFormGroup.disable();
    } else {
      this.addressFormGroup.reset();
      this.addressFormGroup.enable();
    }
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
    if (this.isFirstRender) {
      // Defer patch until form controls are created
      this.isFirstRender = false;
      setTimeout(() => {
        this.addressFormGroup.patchValue(event);
      });
    } else {
      this.addressFormGroup.patchValue(event);
    }
  }

  /**
   * Navigates back to the previous page using the browser history.
   */
  onNavigateBack(): void {
    this.location.back();
  }
}
