import { MatDividerModule } from '@angular/material/divider';
import { Router } from '@angular/router';
import { Component, OnInit, ViewChild } from '@angular/core';
import { GenericTableComponent } from '../../../components/generic-table/generic-table.component';
import {
  AddressRequestDTO,
  AddressResponseDTO,
  PersonRequestDTO,
  PersonResponseDTO,
} from '../../../api';
import { ButtonColor, TableActionButton } from '../../../models/generic-table';
import { MatTabGroup } from '@angular/material/tabs';
import { MatTableDataSource } from '@angular/material/table';
import { PersonsService } from '../../../api';
import { MatTabsModule } from '@angular/material/tabs';
import { ADDRESS_FORM_CONFIG } from '../../../configs/address-config';
import { FormComponent } from '../../../components/form-component/form-component.component';
import { PERSON_FORM_CONFIG } from '../../../configs/person-form';
import { FormGroup } from '@angular/forms';
import { AddressFormComponent } from '../../../components/address-form/address-form.component';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-persons-page',
  imports: [
    GenericTableComponent,
    MatTabGroup,
    MatTabsModule,
    FormComponent,
    MatDividerModule,
    AddressFormComponent,
    MatButtonModule,
  ],
  templateUrl: './persons-page.component.html',
  styleUrls: ['./persons-page.component.css'],
})
export class PersonsPageComponent implements OnInit {
  constructor(private router: Router, private _notifications: MatSnackBar) {}

  // Selected address ID in the address-form-table. Used to create a person with this address-id
  selectedAddressId: number | null = null;

  @ViewChild('tabGroup') tabGroup!: MatTabGroup;

  // Button actions for the table
  actions: TableActionButton[] = [
    {
      id: 'edit',
      label: 'Edit',
      buttonType: 'elevated',
      color: ButtonColor.PRIMARY,
      action: (row: PersonResponseDTO) => this.editPerson(row),
    },
    {
      id: 'delete',
      label: 'Delete',
      buttonType: 'filled',
      color: ButtonColor.WARN,
      action: (row: PersonResponseDTO) => {
        this.deletePerson(row);
      },
    },
    {
      id: 'view',
      label: 'View',
      buttonType: 'text',
      color: ButtonColor.ACCENT,
      action: (row: PersonResponseDTO) => this.viewPerson(row),
    },
  ];

  // Data source to be displayed in the person-table component
  personsDataSource: MatTableDataSource<PersonResponseDTO> =
    new MatTableDataSource<PersonResponseDTO>([]);
  // Columns to be displayed in the person-table component
  personsTableColumns = [
    { id: 'id', label: 'ID' },
    { id: 'name', label: 'Vorname' },
    { id: 'surname', label: 'Nachname' },
    { id: 'email', label: 'E-Mail' },
    { id: 'phone', label: 'Telefonnummer' },
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
  personsFormConfig = PERSON_FORM_CONFIG;
  addressFormConfig = ADDRESS_FORM_CONFIG;
  personForm = new FormGroup({});
  addressForm = new FormGroup({});

  addressMode: string | null = null;

  async ngOnInit(): Promise<void> {
    const persons = await PersonsService.getAllPersons();
    this.personsDataSource = new MatTableDataSource<PersonResponseDTO>(persons);
    const addresses = await PersonsService.getPersonsAddresses();
    this.addressTableDataSource = new MatTableDataSource<AddressResponseDTO>(
      addresses
    );
  }

  editPerson(row: PersonResponseDTO) {
    this.router.navigate(['/persons/', row.id, 'edit']);
  }

  deletePerson(row: PersonResponseDTO) {
    // Implement delete logic here
  }

  viewPerson(row: PersonResponseDTO) {
    this.router.navigate(['/persons/', row.id, 'view']);
  }

  tabChange(event: any) {
    // Handle tab change events
  }

  onRowSelected(event: any) {
    // Handle row selection
  }
  // Signals to be handled coming from the person-form-component
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

  // Handle form submission
  async onSubmit() {

    // Check if both forms are valid
    if (this.personForm.valid && this.addressForm.valid) {
      // Both forms are valid, check the address mode to determine whether to use an existing address or create a new one
      if (this.addressMode === 'existing') {
        // Use the selected rows id to create a person
        if (this.selectedAddressId) {
          const formValue = this.personForm.value as PersonRequestDTO;
          try {
            const response = await PersonsService.createPerson({
              ...formValue,
              address_id: this.selectedAddressId,
            });
          } catch (error) {
            this._notifications.open(
              'Fehler beim Erstellen der Person',
              undefined,
              { duration: 3000 }
            );
          }
          this._notifications.open('Person erfolgreich erstellt', undefined, {
            duration: 3000,
          });
        } else {
          this._notifications.open('Die ausgewählte Adresse ist ungültig. Bitte wählen Sie eine gültige Adresse aus.', undefined, {
            duration: 3000,
          });
        }

      // Handle person creation with a new address. First, create the address. Then, create the person.
      } else {
        try {
          // Adresse erstellen
          const addressResponse = await PersonsService.createPersonAddress(
            this.addressForm.value as AddressRequestDTO
          );
          const addressId = addressResponse.id;

          // Person mit der neuen Adresse erstellen
          const personResponse = await PersonsService.createPerson({
            ...(this.personForm.value as PersonRequestDTO),
            address_id: addressId,
          });

          this._notifications.open('Person erfolgreich erstellt', undefined, {
            duration: 3000,
          });
        } catch (error) {
          // Fehler für Adresse oder Person
          this._notifications.open('Fehler beim Erstellen', undefined, {
            duration: 3000,
          });
          console.error(error);
        }
      }
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

  onBack() {
    this.tabGroup.selectedIndex = 0; // Switch to tab index for "Personenübersicht"
  }

  onAddressSelected($event: number) {
    this.selectedAddressId = $event;
  }
}
