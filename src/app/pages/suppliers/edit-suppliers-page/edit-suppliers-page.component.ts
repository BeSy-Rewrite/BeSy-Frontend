import { SuppliersService } from '../../../api/services/SuppliersService';
import { SupplierResponseDTO } from '../../../api/models/response-dtos/SupplierResponseDTO';
import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EDIT_SUPPLIER_FORM_CONFIG } from '../../../configs/edit/edit-supplier-config';
import { MatDivider } from '@angular/material/divider';
import { FormComponent } from '../../../components/form-component/form-component.component';
import { AddressFormComponent } from '../../../components/address-form/address-form.component';
import { EDIT_ADDRESS_FORM_CONFIG } from '../../../configs/edit/edit-address-config';
import { MatTableDataSource } from '@angular/material/table';
import {
  AddressResponseDTO,
  CustomerIdRequestDTO,
  CustomerIdResponseDTO,
} from '../../../api';
import { EDIT_CUSTOMER_ID_FORM_CONFIG } from '../../../configs/edit/edit-customer-id-config';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
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
    private _notifications: MatSnackBar
  ) {}

  supplierId!: number | unknown; // ID of the supplier being edited
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
      if (isNaN(id)) {
        this.router.navigate(['/not-found'], { skipLocationChange: true });
        return;
      }

      this.supplierId = id;
      this.loadSupplierData(id);
    });
  }

  // * Load supplier data by ID
  async loadSupplierData(id: number) {
    try {
      // Load supplier data
      const supplier: SupplierResponseDTO =
        await SuppliersService.getSupplierById(id);

      // Patch supplier form with loaded data
      this.supplierForm.patchValue(supplier);

      // Load address data
      const address: AddressResponseDTO =
        await SuppliersService.getSuppliersAddress(id);
      this.addressForm.patchValue(address);

      // Load customer ID data and patch it into the table
      const customer_ids = await SuppliersService.getCustomerIdsOfOrder(id);
      this.customerIdTableDataSource =
        new MatTableDataSource<CustomerIdResponseDTO>(customer_ids);

      // Replace supplier name placeholder in customer ID form config
      // so the supplier name is displayed in the title
      this.customerIdFormConfig = {
        ...EDIT_CUSTOMER_ID_FORM_CONFIG,
        title: EDIT_CUSTOMER_ID_FORM_CONFIG.title.replace(
          '{Lieferantenname}',
          this.supplierForm.get('name')?.value || '---'
        ),
      };
    } catch (error) {
      // Handle error in any API call
      this._notifications.open('Fehler beim Laden der Daten', undefined, {
        duration: 3000,
      });
      this.router.navigate(['/not-found'], { skipLocationChange: true });
    }
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

    try {
      // Create supplier customer ID
      await SuppliersService.createSupplierCustomerId(
        this.supplierId as number,
        formData
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
