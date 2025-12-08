import { AfterViewInit, Component, effect, OnInit, signal, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MatButtonToggle,
  MatButtonToggleChange,
  MatButtonToggleGroup,
} from '@angular/material/button-toggle';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { MatTabGroup } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
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
import { EditPersonResolvedData } from '../../../resolver/edit-person.resolver';
import { PersonsWrapperService } from '../../../services/wrapper-services/persons-wrapper.service';

@Component({
  selector: 'app-edit-person-page',
  imports: [
    FormComponent,
    MatButtonModule,
    MatButtonToggleGroup,
    MatButtonToggle,
    MatIcon,
    GenericTableComponent,
  ],
  templateUrl: './edit-person-page.component.html',
  styleUrl: './edit-person-page.component.scss',
})
export class EditPersonPageComponent implements OnInit, AfterViewInit {
  constructor(
    private readonly router: Router,
    private readonly _notifications: MatSnackBar,
    private readonly personsWrapperService: PersonsWrapperService,
    private readonly _dialog: MatDialog,
    private readonly route: ActivatedRoute
  ) {
    effect(() => {
      this.onAddressSelectionModeChanged(this.addressSelectionMode());
    });
  }

  // Selected address ID in the address-form-table. Used to create a person with this address-id
  selectedAddressId: number | undefined = undefined;

  addressSelectionMode = signal<'existing' | 'new' | 'saved'>('existing');

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

  fetchedPerson: PersonResponseDTO | undefined = undefined;
  fetchedAddress: AddressResponseDTO | undefined = undefined;
  personHasSavedAddress = signal<boolean>(false);

  ngOnInit(): void {
    const resolvedData: EditPersonResolvedData = this.route.snapshot.data['personData'];
    this.fetchedPerson = resolvedData.person;
    this.fetchedAddress = resolvedData.address;
    console.log('Fetched Person:', this.fetchedPerson);

    this.personsWrapperService.getAllPersonsAddresses().then(addresses => {
      this.addresses = addresses;
      this.addressTableDataSource = new MatTableDataSource<AddressResponseDTO>(this.addresses);
    });
  }

  ngAfterViewInit(): void {
    // Defer form initialization to allow FormComponent to create controls first
    // Use setTimeout to ensure change detection has run and conditional components are rendered
    setTimeout(() => {
      this.initializeFormGroups();
      setTimeout(() => {
        if (this.fetchedAddress) {
          this.addressFormGroup.patchValue(this.fetchedAddress);
          this.addressFormGroup.disable();
        }
      }, 0);
    }, 0);
  }

  /**
   * Handles changes in the address selection mode.
   * @param event The change event from the address mode toggle group
   */
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
    let addressId = {} as number;

    if (this.addressSelectionMode() === 'new') {
      // Check if the address form has all required fields set
      if (this.addressFormGroup.valid) {
        // Create new address and get the id
        try {
          const addressData = this.addressFormGroup.value as AddressRequestDTO;
          const createdAddress = await this.personsWrapperService.createPersonAddress(addressData);
          if (createdAddress?.id) {
            addressId = createdAddress.id;
            console.log('Created Address:', createdAddress);
          }
        } catch (error) {
          console.error('Error creating address:', error);
          this._notifications.open(
            'Interner Fehler beim Erstellen der Adresse. Bitte versuchen Sie es später erneut.',
            undefined,
            {
              duration: 5000,
            }
          );
          return;
        }
      }
    } else if (this.addressSelectionMode() === 'saved' && this.fetchedAddress) {
      addressId = this.fetchedAddress.id!;
    } else if (this.addressSelectionMode() === 'existing') {
      if (!this.selectedAddressId) {
        this._notifications.open('Bitte wählen Sie eine Adresse aus der Tabelle aus.', undefined, {
          duration: 3000,
        });
        return;
      }
      addressId = this.selectedAddressId;
    }

    // Combine person data with address ID if available
    const updatedPersonData: PersonRequestDTO = {
      ...personData,
      address_id: addressId || undefined,
    };

    // Check if any changes were made
    if (!this.hasChanges(this.fetchedPerson, updatedPersonData)) {
      this._notifications.open('Es wurden keine Änderungen vorgenommen.', undefined, {
        duration: 3000,
      });
      return;
    }
    try {
      // Send update request
      const updatedPerson = await this.personsWrapperService.updatePerson(
        this.fetchedPerson!.id!,
        updatedPersonData
      );
      console.log('Updated Person:', updatedPerson);
      this._notifications.open('Person erfolgreich aktualisiert.', undefined, {
        duration: 3000,
      });
    } catch (error) {
      console.error('Error updating person:', error);
      this._notifications.open(
        'Interner Fehler beim Aktualisieren der Person. Bitte versuchen Sie es später erneut.',
        undefined,
        {
          duration: 5000,
        }
      );
      return;
    }
  }

  private onAddressSelectionModeChanged(mode: 'existing' | 'new' | 'saved'): void {
    if (mode === 'existing') {
      this.addressModeInfoText.set(
        'Wählen Sie eine bestehende Adresse aus der Tabelle aus und überprüfen Sie die Daten im Formular darunter.'
      );
      this.selectedAddressId = undefined;
    } else if (mode === 'new') {
      this.addressModeInfoText.set('Geben Sie die Daten für eine neue Adresse ein.');
    } else if (mode === 'saved') {
      this.addressModeInfoText.set('Die aktuell gespeicherte Adresse wird unterhalb angezeigt.');
      this.addressFormGroup.patchValue(this.fetchedAddress ?? {});
      this.addressFormGroup.disable();
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
        // Reset forms to initial fetched data
        this.personFormGroup.reset(this.fetchedPerson ?? {});
        this.addressFormGroup.reset(this.fetchedAddress ?? {});
        this.selectedAddressId = undefined;
      }
    });
  }

  /**
   * Handles selection of an address in the address table.
   * @param $event The selected address from the table or null if none selected
   */
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

  /**
   * Initializes the form groups with fetched data.
   */
  private initializeFormGroups() {
    // Initialize person form group
    this.personFormGroup.patchValue(this.fetchedPerson ?? {});
    // Initialize person form with fetched data)
    if (this.fetchedAddress) {
      this.addressSelectionMode.set('saved');
      this.addressFormGroup.disable();
      this.personHasSavedAddress.set(true);
    }
  }

  /**
   * Helper function to check if there are changes between the original and updated person data
   * @param original the original person data
   * @param updated the updated person data
   * @returns true if there are changes, false otherwise
   */
  private hasChanges(original: PersonResponseDTO | undefined, updated: PersonRequestDTO): boolean {
    if (!original) return true; // If no original, treat as changes

    // Compare all fields in the updated data with the original
    for (const key in updated) {
      if (updated[key as keyof PersonRequestDTO] !== original[key as keyof PersonResponseDTO]) {
        return true; // Found a difference
      }
    }
    return false; // No changes found
  }
}
