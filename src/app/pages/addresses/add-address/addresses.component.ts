import { AddressesService, AddressResponseDTO } from '../../../api2_0';
import { MatTableDataSource } from '@angular/material/table';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTabsModule } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GenericFormPageComponent } from '../../../components/generic-form-page/generic-form-page.component';
import { createAddressFormConfig } from '../../../configs/form-configs';
import { GenericTableComponent } from '../../../components/generic-table/generic-table.component';
import { ButtonColor, TableActionButton } from '../../../models/generic-table';
import { ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-addresses',
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
    MatTabsModule,
    GenericFormPageComponent,
    GenericTableComponent
  ],
  templateUrl: './addresses.component.html',
  styleUrl: './addresses.component.css'
})
export class AddressesComponent {
  // Properties for managing view states
  constructor(
      private AddressesService: AddressesService,
      private MatIconRegistry: MatIconRegistry,
      private sanitizer: DomSanitizer,
      private router: Router
  ) {
    this.MatIconRegistry.addSvgIcon(
      'add_button',
      this.sanitizer.bypassSecurityTrustResourceUrl('assets/add_button.svg')
    );
  }


  edit = false;
  details = false;
  detailElement: any = null;
  @ViewChild('tabGroup') tabGroup: any; // Reference to the MatTabGroup for programmatic control
  datasource: MatTableDataSource<AddressResponseDTO> = new MatTableDataSource<AddressResponseDTO>([]);
  addressColumns = [{ id: 'id', label: 'ID' }, { id: 'street', label: 'Straße' }, { id: 'town', label: 'Stadt' }, { id: 'postal_code', label: 'PLZ' }, { id: 'country', label: 'Land' }];

  // Define the actions for the table columns
  actions: TableActionButton[] = [
      {
        id: 'edit',
        label: 'Edit',
        buttonType: 'elevated',
        color: ButtonColor.PRIMARY,
        action: (row: AddressResponseDTO) => this.editAddress(row)
      },
      {
        id: 'delete',
        label: 'Delete',
        buttonType: 'filled',
        color: ButtonColor.WARN,
        action: (row: AddressResponseDTO) => { this.deleteAddress(row); }
      },
      {
        id: 'view',
        label: 'View',
        buttonType: 'text',
        color: ButtonColor.ACCENT,
        action: (row: AddressResponseDTO) => this.viewAddress(row)
      }
    ]
  // Form configuration for the generic form component
  addressFormConfig = createAddressFormConfig(false);


  async ngOnInit() : Promise<void> {
    // Initialize any necessary data or services here
    console.log('AddressesComponent initialized');
    const addresses = await AddressesService.getAllAddresses();
    this.datasource = new MatTableDataSource<AddressResponseDTO>(addresses);
  }

  // Tab change handler
  tabChange(event: any) {
    // Reset view states when switching tabs
    this.edit = false;
    this.details = false;
    this.detailElement = null;
  }

  // View change handlers
  detailsViewChange(event: any, address?: any) {
    this.details = !this.details;
    this.edit = false;
    if (address) {
      this.detailElement = address;
    }
  }

  // Edit view change handlers
  // This method toggles the edit view and can optionally set the detailElement to the provided address
  // If no address is provided, it simply toggles the edit state
  editViewChange(event: any, address?: any) {
    this.edit = !this.edit;
    this.details = false;
    if (address) {
      this.detailElement = address;
    }
  }

  // Add button click handler for the add-Address button below the table
  addButtonClick() {
    this.edit = false;
    this.details = false;
    this.detailElement = null;
    this.tabGroup.selectedIndex = 1; // Switch to tab index for "Adresse anlegen"

  }

  // Handler for when address is created via generic form
  // ToDo: Implement this method to handle the address creation logic
  // Steps: 1. Make an API call to create the address, handle success/failure, and update the UI accordingly
  //        2. You might want to refresh the addresses list or show a success message
  //        3. Optionally, switch back to the first tab to show the updated list
  onAddressCreated(addressData: any) {
    console.log('Address created:', addressData);
    // Call the service to create the address




    // Handle successful address creation
    // You might want to refresh the addresses table, show a success message, etc.

    // Example: Switch back to the first tab to show the updated list
    // You could emit an event to refresh the addresses table here

  }

  onRowSelected(row: any) {
    console.log('Row selected:', row);
    this.detailsViewChange(null, row);
  }

  onActionClicked(action: any) {
    console.log('Action clicked:', action);
    // Handle action clicks (e.g., edit, delete)
  }

  // Navigate to the edit address page
  // This method is called when the edit button in the table is clicked
  editAddress(address: AddressResponseDTO) {
    this.router.navigate(['/addresses/', address.id, 'edit']);
  }

  // Navigate to the view address page
  // This method is called when the view button in the table is clicked
  viewAddress(address: AddressResponseDTO) {
    this.router.navigate(['/addresses/', address.id, 'detail']);
  }

  deleteAddress(address: AddressResponseDTO) {
    // Implement the logic to delete the address
    // This could involve calling a service method to delete the address and then updating the UI accordingly
    console.log('Delete address:', address);
    /* AddressesService.deleteAddress(address.id).then(() => {
      // Optionally, refresh the addresses list or show a success message
      this.datasource.data = this.datasource.data.filter(a => a.id !== address.id);
    }).catch(error => {
      console.error('Error deleting address:', error);
    }); */
  }
}
