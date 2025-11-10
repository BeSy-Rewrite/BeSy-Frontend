import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { MatTabGroup, MatTabsModule } from '@angular/material/tabs';
import { Router } from '@angular/router';
import {
  AddressRequestDTO,
  AddressResponseDTO,
  PersonRequestDTO,
  PersonResponseDTO,
} from '../../../api-services-v2';
import { AddressFormComponent } from '../../../components/address-form/address-form.component';
import { FormComponent } from '../../../components/form-component/form-component.component';
import { GenericTableComponent } from '../../../components/generic-table/generic-table.component';
import { ADDRESS_FORM_CONFIG } from '../../../configs/create-address-config';
import { PERSON_FORM_CONFIG } from '../../../configs/person-form';
import { ButtonColor, TableActionButton } from '../../../models/generic-table';
import { PersonsWrapperService } from '../../../services/wrapper-services/persons-wrapper.service';

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
  styleUrls: ['./persons-page.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PersonsPageComponent implements OnInit {
  constructor(private router: Router, private _notifications: MatSnackBar, private personsWrapperService: PersonsWrapperService) { }

  // Selected address ID in the address-form-table. Used to create a person with this address-id
  selectedAddressId: number | undefined = undefined;

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

  addressMode: string | undefined = undefined;

  async ngOnInit(): Promise<void> {
    const persons = await this.personsWrapperService.getAllPersons();
    this.personsDataSource = new MatTableDataSource<PersonResponseDTO>(persons);
    const addresses = await this.personsWrapperService.getAllPersonsAddresses();
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

  // Signals to be handled coming from the address-form-component
  onAddressFormValueChanged(event: { field: string; value: any }) {
    // Handle address form value changes if needed
    if (event.field === 'addressMode') {
      this.addressMode = event.value;

      // Reset address form fields, but not the table or addressMode
      const fieldsToReset = [
        'building_name',
        'street',
        'building_number',
        'town',
        'postal_code',
        'county',
        'country',
        'comment',
      ];

      fieldsToReset.forEach((field) => {
        if (this.addressForm.get(field)) {
          this.addressForm.get(field)?.reset();
        }
      });

      // Reset selected address ID
      this.selectedAddressId = undefined;
    }
  }

  // * Handle form submission
  async onSubmit() {
    // Check if the person form has all required fields set
    if (!this.personForm.valid) {
      this.personForm.markAllAsTouched();
      this._notifications.open('Bitte Personendaten prüfen.', undefined, {
        duration: 3000,
      });
      return;
    }

    // Get person form data
    const personData = this.personForm.value as PersonRequestDTO;

    // Case 1: an existing address is used to create a person
    if (this.addressMode === 'existing') {
      if (this.selectedAddressId && this.selectedAddressId !== null) {
        try {
          await this.personsWrapperService.createPerson({
            ...personData,
            address_id: this.selectedAddressId,
          });
          this._notifications.open('Person erfolgreich erstellt', undefined, {
            duration: 3000,
          });
        } catch (error) {
          this._notifications.open(
            'Fehler beim Erstellen der Person',
            undefined,
            { duration: 3000 }
          );
        }
      }
      // No address selected in existing addresses
      // Create person without address
      else {
        try {
          await this.personsWrapperService.createPerson({
            ...personData,
          });
          this._notifications.open('Person erfolgreich erstellt', undefined, {
            duration: 3000,
          });
        } catch (error) {
          this._notifications.open(
            'Fehler beim Erstellen der Person',
            undefined,
            { duration: 3000 }
          );
        }
      }

      return;
    }

    // Case 2: a new address is created
    const addressData = this.addressForm.value as AddressRequestDTO;

    // Check if any address field is filled besides the addressMode radio button
    const addressFilled = Object.entries(addressData).some(
      ([key, val]) =>
        key !== 'addressMode' &&
        val !== null &&
        val !== undefined &&
        String(val).trim() !== ''
    );

    if (!addressFilled) {
      // Person ohne Adresse erstellen
      try {
        await this.personsWrapperService.createPerson(personData);
        this._notifications.open(
          'Person erfolgreich erstellt (ohne Adresse)',
          undefined,
          {
            duration: 3000,
          }
        );
      } catch (error) {
        this._notifications.open(
          'Fehler beim Erstellen der Person',
          undefined,
          {
            duration: 3000,
          }
        );
      }
    } else {
      // Adresse ist teilweise/komplett ausgefüllt → Address-Form muss gültig sein
      if (!this.addressForm.valid) {
        this.addressForm.markAllAsTouched();
        this._notifications.open('Bitte Adressdaten prüfen.', undefined, {
          duration: 3000,
        });
        return;
      }

      try {
        const addressResponse = await this.personsWrapperService.createPersonAddress(
          addressData
        );
        const addressId = addressResponse.id;

        await this.personsWrapperService.createPerson({
          ...personData,
          address_id: addressId,
        });

        this._notifications.open('Person erfolgreich erstellt', undefined, {
          duration: 3000,
        });
      } catch (error) {
        this._notifications.open('Fehler beim Erstellen', undefined, {
          duration: 3000,
        });
      }
    }
  }

  // Handle back navigation
  // Change tab
  onBack() {
    this.tabGroup.selectedIndex = 0; // Switch to tab index for "Personenübersicht"
  }

  // Catch emitted event from address-form-component
  // Update selectedAddressId with the selected address ID
  onAddressSelected($event: number) {
    this.selectedAddressId = $event;
    if (this.selectedAddressId == null) {
      // selectedAddressId is null when the same row is clicked again (unselected)
      // Reset address form fields, but not the table or addressMode
      const fieldsToReset = ['building_name', 'street', 'building_number', 'town', 'postal_code', 'county', 'country', 'comment'];

      fieldsToReset.forEach((field) => {
        this.addressForm.get(field)?.reset();
      });
    }
  }
}
