import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { SuppliersWrapperService } from '../../../services/wrapper-services/suppliers-wrapper.service';
import { FormComponent } from '../../../components/form-component/form-component.component';
import { AddressFormComponent } from '../../../components/address-form/address-form.component';
import { EDIT_SUPPLIER_ADDRESS_FORM_CONFIG } from '../../../configs/edit/edit-address-config';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AddressRequestDTO,
  CustomerIdResponseDTO,
  SupplierRequestDTO,
  VatResponseDTO,
} from '../../../api-services-v2'
import { EDIT_CUSTOMER_ID_FORM_CONFIG } from '../../../configs/edit/edit-customer-id-config';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../../../components/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { VatWrapperService } from '../../../services/wrapper-services/vats-wrapper.service';
import { EDIT_SUPPLIER_FORM_CONFIG } from '../../../configs/edit/edit-supplier-config';
@Component({
  selector: 'app-edit-suppliers-page',
  imports: [MatDivider, FormComponent, AddressFormComponent, MatButtonModule],
  templateUrl: './edit-suppliers-page.component.html',
  styleUrl: './edit-suppliers-page.component.scss',
})
export class EditSuppliersPageComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private _notifications: MatSnackBar,
    private suppliersWrapperService: SuppliersWrapperService,
    private dialog: MatDialog,
    private vatWrapperService: VatWrapperService
  ) {}

  supplierId!: number | unknown; // ID of the supplier being edited

  supplierForm = new FormGroup({});
  supplierFormConfig = EDIT_SUPPLIER_FORM_CONFIG;

  addressForm = new FormGroup({});
  addressFormConfig = EDIT_SUPPLIER_ADDRESS_FORM_CONFIG;

  customerIdForm = new FormGroup({});
  customerIdFormConfig = EDIT_CUSTOMER_ID_FORM_CONFIG;

  // Customer ID table data to display already existent customer IDs
  customerIdTableDataSource = new MatTableDataSource<CustomerIdResponseDTO>([]);
  customerIdTableColumns = [
    { id: 'customer_id', label: 'Bereits hinzugefügte Kundennummern' },
    { id: 'comment', label: 'Kommentar' },
  ];

  async ngOnInit(): Promise<void> {
    this.route.paramMap.subscribe(async (params) => {
      const id = Number(params.get('id'));
      if (isNaN(id)) {
        this.router.navigate(['/not-found'], { skipLocationChange: true });
        return;
      }

      this.supplierId = id;

      try {
        const [supplier, vatOptions, address, customerIds] = await Promise.all([
          this.suppliersWrapperService.getSupplierById(id),
          this.vatWrapperService.getAllVats(),
          this.suppliersWrapperService.getSupplierAddress(id),
          this.suppliersWrapperService.getCustomersIdsBySupplierId(id)
        ]);

        // Dropdowns setzen
        this.setDropdownOptions(vatOptions);

        // Form patchen (jetzt sind Optionen da!)
        this.supplierForm.patchValue({
          ...supplier,
          vat_id: supplier.vat_id ? Number(supplier.vat_id) : null // Convert vat_id from string to number to match with the vat_id in the dropdown
        })
        this.addressForm.patchValue(address);

        this.customerIdTableDataSource =
          new MatTableDataSource<CustomerIdResponseDTO>(customerIds);

        // Titel ersetzen
        this.supplierFormConfig = {
          ...EDIT_SUPPLIER_FORM_CONFIG,
          title: EDIT_SUPPLIER_FORM_CONFIG.title!.replace(
            '{Lieferantenname}',
            this.supplierForm.get('name')?.value || '---'
          ),
        };
      } catch (error) {
        console.error(error);
        this._notifications.open('Fehler beim Laden der Daten', undefined, {
          duration: 3000,
        });
        this.router.navigate(['/not-found'], { skipLocationChange: true });
      }
    });
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

  /**
   * * Navigate back to the suppliers list page
   */
  onBack() {
    this.router.navigate(['/suppliers']);
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

    dialogRef.afterClosed().subscribe(async (confirmed) => {
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
      await this.suppliersWrapperService.updateSupplier(
        this.supplierId as number,
        supplierRequest
      );

      this._notifications.open('Änderungen gespeichert', undefined, {
        duration: 3000,
      });
    } catch (error) {
      // Handle error in API call
      this._notifications.open(
        'Fehler beim Speichern der Änderungen',
        undefined,
        { duration: 3000 }
      );
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
      this._notifications.open(
        'Fehler beim Erstellen der Kundennummer',
        undefined,
        { duration: 3000 }
      );
    }
  }
}
