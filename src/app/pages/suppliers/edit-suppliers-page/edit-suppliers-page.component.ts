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
import { MatDialog } from '@angular/material/dialog';
import { MatDivider } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AddressRequestDTO,
  AddressResponseDTO,
  CustomerIdRequestDTO,
  CustomerIdResponseDTO,
  SupplierRequestDTO,
  SupplierResponseDTO,
} from '../../../api-services-v2';
import { AddressFormComponent } from '../../../components/address-form/address-form.component';
import { ConfirmDialogComponent } from '../../../components/confirm-dialog/confirm-dialog.component';
import { FormComponent } from '../../../components/form-component/form-component.component';
import { EDIT_SUPPLIER_ADDRESS_FORM_CONFIG } from '../../../configs/edit/edit-address-config';
import { EDIT_CUSTOMER_ID_FORM_CONFIG } from '../../../configs/edit/edit-customer-id-config';
import { SUPPLIER_FORM_CONFIG } from '../../../configs/supplier/supplier-config';
import { ButtonColor, TableActionButton } from '../../../models/generic-table';
import { EditSupplierResolvedData } from '../../../resolver/edit-supplier.resolver';
import { SuppliersWrapperService } from '../../../services/wrapper-services/suppliers-wrapper.service';
@Component({
  selector: 'app-edit-suppliers-page',
  imports: [MatDivider, FormComponent, AddressFormComponent, MatButtonModule],
  templateUrl: './edit-suppliers-page.component.html',
  styleUrl: './edit-suppliers-page.component.scss',
})
export class EditSuppliersPageComponent implements OnInit, AfterViewInit {
  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly _notifications: MatSnackBar,
    private readonly suppliersWrapperService: SuppliersWrapperService,
    private readonly dialog: MatDialog,
    private readonly cdr: ChangeDetectorRef
  ) {}

  supplierForm = new FormGroup({});
  supplierFormConfig = SUPPLIER_FORM_CONFIG;

  addressForm = new FormGroup({});
  addressFormConfig = EDIT_SUPPLIER_ADDRESS_FORM_CONFIG;

  customerIdForm = new FormGroup({});
  customerIdFormConfig = EDIT_CUSTOMER_ID_FORM_CONFIG;

  addressIsSelected: WritableSignal<boolean> = signal(false);
  customerIDs = signal<CustomerIdResponseDTO[]>([]);
  customerIDsToDelete = signal<CustomerIdResponseDTO[]>([]);
  customerIDsTableDataSource = new MatTableDataSource<CustomerIdResponseDTO>([]);
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
  supplier: SupplierResponseDTO | undefined = undefined;
  supplierId: number | undefined = undefined;
  supplierAddress: AddressResponseDTO | undefined = undefined;

  ngOnInit(): void {
    const supplierData = this.route.snapshot.data['supplierData'] as EditSupplierResolvedData;
    this.supplierId = supplierData.supplier.id;

    this.customerIDs.set(
      (supplierData.customerIds ?? []).map(custId => ({
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

    if (this.supplierAddress) {
      this.addressForm.patchValue(this.supplierAddress);
    }

    // Titel ersetzen
    this.supplierFormConfig = {
      ...SUPPLIER_FORM_CONFIG,
      title: SUPPLIER_FORM_CONFIG.title!.replace(
        '{Lieferantenname}',
        this.supplierForm.get('name')?.value ?? '---'
      ),
    };
  }

  /**
   * * Navigate back to the suppliers list page
   */
  onBack() {
    this.router.navigate(['/suppliers']);

    this.supplierForm.patchValue({
      ...this.supplier,
      vat_id: this.supplier?.vat_id ? Number(this.supplier.vat_id) : null, // Convert vat_id from string to number to match with the vat_id in the dropdown
    });

    if (this.supplierAddress) {
      this.addressForm.patchValue(this.supplierAddress);
    }

    // Titel ersetzen
    this.supplierFormConfig = {
      ...SUPPLIER_FORM_CONFIG,
      title: SUPPLIER_FORM_CONFIG.title!.replace(
        '{Lieferantenname}',
        this.supplierForm.get('name')?.value ?? '---'
      ),
    };
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
    // Validate forms
    if (this.supplierForm.invalid || this.addressForm.invalid) {
      this._notifications.open('Bitte alle Pflichtfelder ausfüllen', undefined, { duration: 3000 });
      return;
    }

    // Prepare form data for submission
    const supplierFormData = this.supplierForm.value as SupplierRequestDTO;
    const addressFormData = this.addressForm.value as AddressRequestDTO;
    const customerIdFormData: any = { ...this.customerIdForm.value };
    delete customerIdFormData.customer_table; // Remove table data from customer id form value

    const supplierRequest: SupplierRequestDTO = {
      ...supplierFormData,
      address: addressFormData,
    };

    try {
      // Update supplier data
      await this.suppliersWrapperService.updateSupplier(this.supplierId as number, supplierRequest);

      this._notifications.open('Änderungen gespeichert', undefined, {
        duration: 3000,
      });
    } catch (error) {
      console.error('Error saving supplier changes:', error);
      // Handle error in API call
      this._notifications.open('Fehler beim Speichern der Änderungen', undefined, {
        duration: 3000,
      });
    }

    // If customer_id field is empty, do not attempt to create a new customer ID
    if (!customerIdFormData.customer_id?.trim()) {
      return;
    }
    try {
      // Create supplier customer ID
      await this.suppliersWrapperService.createSupplierCustomerId(
        this.supplierId as number,
        customerIdFormData
      );
      this._notifications.open('Kundennummer erstellt', undefined, {
        duration: 3000,
      });
    } catch (error) {
      // Handle error in API call
      console.error('Error creating customer ID:', error);
      this._notifications.open('Fehler beim Erstellen der Kundennummer', undefined, {
        duration: 3000,
      });
    }
  }

  onDeleteCustomerID(row: CustomerIdResponseDTO) {
    // !ToDo: Deleting is likely not possible because there is no endpoint for it yet
    // If the field supplier_id is set, it means the customer ID exists in the backend and needs to be deleted there as well
    if (row.supplier_id) {
      this.customerIDsToDelete.update(current => [
        ...current,
        { customer_id: row.customer_id, comment: row.comment ?? '' },
      ]);
    }

    // Remove from the displayed table
    this.customerIDs.update(current =>
      current.filter(item => item.customer_id !== row.customer_id || item.comment !== row.comment)
    );
    this.customerIDsTableDataSource.data = this.customerIDs();
  }
}
