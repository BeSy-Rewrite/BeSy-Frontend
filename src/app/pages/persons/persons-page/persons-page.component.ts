import { Component, effect, OnInit, signal, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleChange, MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
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
import { ConfirmDialogComponent } from '../../../components/confirm-dialog/confirm-dialog.component';
import { FormComponent } from '../../../components/form-component/form-component.component';
import { GenericTableComponent } from '../../../components/generic-table/generic-table.component';
import { PERSON_ADDRESS_FORM_CONFIG } from '../../../configs/person-address-form-config';
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
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
  ],
  templateUrl: './persons-page.component.html',
  styleUrls: ['./persons-page.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PersonsPageComponent implements OnInit {
  constructor(
    private readonly router: Router,
    private readonly _notifications: MatSnackBar,
    private readonly personsWrapperService: PersonsWrapperService,
    private readonly _dialog: MatDialog
  ) {
    effect(() => {
      this.onAddressSelectionModeChanged(this.addressSelectionMode());
    });
  }

  // Selected address ID in the address-form-table. Used to create a person with this address-id
  selectedAddressId: number | undefined = undefined;

  addressSelectionMode = signal<'existing' | 'new'>('existing');

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
  addressFormConfig = PERSON_ADDRESS_FORM_CONFIG;
  personFormGroup = new FormGroup({});
  addressFormGroup = new FormGroup({});
  addresses: AddressResponseDTO[] = [] as AddressResponseDTO[];

  addressMode: string | undefined = undefined;
  addressModeInfoText = signal<string>(
    'Wählen Sie eine bestehende Adresse aus der Tabelle aus und überprüfen Sie die Daten im Formular darunter.'
  );

  ngOnInit(): void {
    this.personsWrapperService.getAllPersons().then(persons => {
      this.personsDataSource = new MatTableDataSource<PersonResponseDTO>(persons);
    });
    this.personsWrapperService.getAllPersonsAddresses().then(addresses => {
      this.addresses = addresses;
      this.addressTableDataSource = new MatTableDataSource<AddressResponseDTO>(this.addresses);
    });
    this.addressFormGroup.disable();
  }

  onAddressModeChange(event: MatButtonToggleChange): void {
    this.addressSelectionMode.set(event.value);
    // Reset form state when switching modes
    if (event.value === 'new') {
      this.addressFormGroup.reset();
      this.addressFormGroup.enable();
      this.selectedAddressId = undefined;
    } else {
      this.addressFormGroup.reset();
      this.addressFormGroup.disable();
      this.selectedAddressId = undefined;
    }
  }

  editPerson(row: PersonResponseDTO) {
    this.router.navigate(['/persons/', row.id, 'edit']);
  }

  // * Handle form submission
  async onSubmit() {
    // Check if the person form has all required fields set
    if (!this.personFormGroup.valid) {
      this.personFormGroup.markAllAsTouched();
      this._notifications.open('Bitte Personendaten prüfen.', undefined, {
        duration: 3000,
      });
      return;
    }

    // Get person form data
    const personData = this.personFormGroup.value as PersonRequestDTO;

    // Case 1: an existing address is used to create a person
    if (this.addressSelectionMode() === 'existing') {
      if (this.selectedAddressId) {
        try {
          await this.personsWrapperService.createPerson({
            ...personData,
            address_id: this.selectedAddressId,
          });
          this._notifications.open('Person erfolgreich erstellt', undefined, {
            duration: 3000,
          });
        } catch (error) {
          console.error('Error creating person:', error);
          this._notifications.open('Fehler beim Erstellen der Person', undefined, {
            duration: 3000,
          });
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
          console.error('Error creating person:', error);
          this._notifications.open('Fehler beim Erstellen der Person', undefined, {
            duration: 3000,
          });
        }
      }

      return;
    }

    // Case 2: a new address is created
    const addressData = this.addressFormGroup.value as AddressRequestDTO;

    // Check if any address field is filled
    const addressFilled = Object.entries(addressData).some(
      ([, val]) => val !== null && val !== undefined && String(val).trim() !== ''
    );

    if (addressFilled) {
      // Address fields are filled, validate address form
      if (!this.addressFormGroup.valid) {
        this.addressFormGroup.markAllAsTouched();
        this._notifications.open('Bitte Adressdaten prüfen.', undefined, {
          duration: 3000,
        });
        return;
      }

      try {
        const addressResponse = await this.personsWrapperService.createPersonAddress(addressData);
        const addressId = addressResponse.id;

        await this.personsWrapperService.createPerson({
          ...personData,
          address_id: addressId,
        });

        this._notifications.open('Person erfolgreich erstellt', undefined, {
          duration: 3000,
        });
      } catch (error) {
        console.error('Error creating person with new address:', error);
        this._notifications.open('Fehler beim Erstellen', undefined, {
          duration: 3000,
        });
      }
    } else {
      // Create person without address
      try {
        await this.personsWrapperService.createPerson(personData);
        this._notifications.open('Person erfolgreich erstellt (ohne Adresse)', undefined, {
          duration: 3000,
        });
      } catch (error) {
        console.error('Error creating person without address:', error);
        this._notifications.open('Fehler beim Erstellen der Person', undefined, {
          duration: 3000,
        });
      }
    }
  }

  private onAddressSelectionModeChanged(mode: 'existing' | 'new'): void {
    if (mode === 'existing') {
      this.addressModeInfoText.set(
        'Wählen Sie eine bestehende Adresse aus der Tabelle aus und überprüfen Sie die Daten im Formular darunter.'
      );
    } else {
      this.addressModeInfoText.set('Geben Sie die Daten für eine neue Adresse ein.');
    }
  }

  // Handle back navigation
  // Change tab
  onBack() {
    // Display confirmation dialog if resetting all forms
    const dialogRef = this._dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Alle Änderungen zurücksetzen',
        message:
          'Möchten Sie wirklich alle Änderungen zurücksetzen? Alle ungespeicherten Änderungen gehen verloren.',
        confirmButtonText: 'Zurücksetzen',
        cancelButtonText: 'Abbrechen',
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.personFormGroup.reset();
        this.addressFormGroup.reset();
        this.selectedAddressId = undefined;
        this.tabGroup.selectedIndex = 0; // Switch to tab index for "Personenübersicht"
      }
    });
  }

  // Catch emitted event from address-form-component
  // Update selectedAddressId with the selected address ID
  onAddressInTableSelected($event: AddressResponseDTO | null) {
    if ($event) {
      this.selectedAddressId = $event.id!;
      this.addressFormGroup.enable();
      this.addressFormGroup.patchValue($event);
      if (this.addressSelectionMode() == 'existing') {
        this.addressFormGroup.disable();
      }
    } else {
      this.selectedAddressId = undefined;
      this.addressFormGroup.reset();
    }
  }
}
