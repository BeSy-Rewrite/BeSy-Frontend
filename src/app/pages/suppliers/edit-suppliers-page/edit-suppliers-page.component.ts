import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import {
  CustomerIdRequestDTO,
  CustomerIdResponseDTO
} from '../../../apiv2';
import { AddressFormComponent } from '../../../components/address-form/address-form.component';
import { FormComponent } from '../../../components/form-component/form-component.component';
import { EDIT_ADDRESS_FORM_CONFIG } from '../../../configs/edit/edit-address-config';
import { EDIT_CUSTOMER_ID_FORM_CONFIG } from '../../../configs/edit/edit-customer-id-config';
import { EDIT_SUPPLIER_FORM_CONFIG } from '../../../configs/edit/edit-supplier-config';
import { SuppliersWrapperService } from '../../../services/wrapper-services/suppliers-wrapper.service';
@Component({
  selector: 'app-edit-suppliers-page',
  imports: [MatDivider, FormComponent, AddressFormComponent, MatButtonModule],
  templateUrl: './edit-suppliers-page.component.html',
  styleUrl: './edit-suppliers-page.component.scss',
})
export class EditSuppliersPageComponent implements OnInit {
  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly _notifications: MatSnackBar,
    private readonly suppliersWrapperService: SuppliersWrapperService
  ) { }

  supplierId!: number; // ID of the supplier being edited
  supplierName = ''; // Placeholder variable for the supplier name in the customer-id-form title

  supplierForm = new FormGroup({});
  supplierFormConfig = EDIT_SUPPLIER_FORM_CONFIG;

  addressForm = new FormGroup({});
  addressFormConfig = EDIT_ADDRESS_FORM_CONFIG;

  customerIdForm = new FormGroup({});
  customerIdFormConfig = EDIT_CUSTOMER_ID_FORM_CONFIG;

  // Customer ID table data to display already existent customer IDs
  customerIdTableDataSource = new MatTableDataSource<CustomerIdResponseDTO>([]);
  customerIdTableColumns = [
    { id: 'customer_id', label: 'Bereits hinzugefügte Kundennummern' },
    { id: 'comment', label: 'Kommentar' },
  ];

  ngOnInit(): void {
    // Subscribe to route parameters
    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));

      // Check if id is a valid number
      if (Number.isNaN(id)) {
        this.router.navigate(['/not-found'], { skipLocationChange: true });
        return;
      }

      this.supplierId = id;
      this.loadSupplierData(id);
    });
  }

  // * Load supplier data by ID
  loadSupplierData(id: number) {
    forkJoin({
      supplier: this.suppliersWrapperService.getSupplierById(id),
      address: this.suppliersWrapperService.getSupplierAddress(id),
      customer_ids: this.suppliersWrapperService.getCustomersIdBySupplier(id)
    }).subscribe({
      next: ({ supplier, address, customer_ids }) => {
        this.supplierForm.patchValue(supplier);
        this.addressForm.patchValue(address);
        this.customerIdTableDataSource = new MatTableDataSource<CustomerIdResponseDTO>(customer_ids);

        // Replace supplier name placeholder in customer ID form config
        // so the supplier name is displayed in the title
        this.customerIdFormConfig = {
          ...EDIT_CUSTOMER_ID_FORM_CONFIG,
          title: EDIT_CUSTOMER_ID_FORM_CONFIG.title.replace(
            '{Lieferantenname}',
            this.supplierForm.get('name')?.value ?? '---'
          ),
        };
      },
      error: () => {
        // Handle error in any API call
        this._notifications.open('Fehler beim Laden der Daten', undefined, {
          duration: 3000,
        });
        this.router.navigate(['/not-found'], { skipLocationChange: true });
      }
    });
  }

  // * Handle back navigation
  onBack() {
    this.router.navigate(['/suppliers']);
  }

  // * Handle form submission. Currently only adding customer IDs
  // * is possible while editing suppliers
  async onSubmit() {
    // Handle invalid form submission
    if (!this.customerIdForm.valid) {
      this.customerIdForm.markAllAsTouched();
      this._notifications.open(
        'Bitte füllen Sie alle erforderlichen Felder aus.',
        undefined,
        { duration: 3000 }
      );
      return;
    }

    // Prepare form data for submission
    const formData = this.customerIdForm.value as CustomerIdRequestDTO;

    // Create supplier customer ID
    this.suppliersWrapperService.createSupplierCustomerId(
      this.supplierId,
      formData
    ).subscribe({
      next: () => {
        this._notifications.open('Kundennummer erstellt', undefined, {
          duration: 3000,
        });
      },
      error: () => {
        // Handle error in API call
        this._notifications.open(
          'Fehler beim Erstellen der Kundennummer',
          undefined,
          { duration: 3000 }
        );
      }
    });
  }
}
