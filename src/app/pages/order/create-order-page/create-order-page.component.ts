import { AddressResponseDTO } from './../../../api/models/response-dtos/AddressResponseDTO';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { ProgressBarComponent } from '../../../components/progress-bar/progress-bar.component';
import { MatDivider } from '@angular/material/divider';
import { FormComponent } from '../../../components/form-component/form-component.component';
import { OnInit } from '@angular/core';
import { FormConfig } from '../../../components/form-component/form-component.component';
import { ORDER_ITEM_FORM_CONFIG } from '../../../configs/order/order-item-config';
import { FormControl, FormGroup } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { ItemRequestDTO } from '../../../api/models/request-dtos/ItemRequestDTO';
import { MatTableDataSource } from '@angular/material/table';
import {
  ButtonColor,
  TableActionButton,
  TableColumn,
} from '../../../models/generic-table';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { GenericTableComponent } from '../../../components/generic-table/generic-table.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  AddressRequestDTO,
  OrderRequestDTO,
  PersonResponseDTO,
  QuotationRequestDTO,
  VatResponseDTO,
  VatSService,
} from '../../../api';
import {
  ORDER_ADDRESS_FORM_CONFIG,
  ORDER_QUOTATION_FORM_CONFIG,
} from '../../../configs/order/order-config';
import { PersonsService } from '../../../api';
import { map, Observable, of, startWith } from 'rxjs';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import {
  MatButtonToggle,
  MatButtonToggleGroup,
} from '@angular/material/button-toggle';
import { MatRadioButton, MatRadioModule } from '@angular/material/radio';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-order-page',
  imports: [
    ProgressBarComponent,
    MatDivider,
    FormComponent,
    MatButton,
    GenericTableComponent,
    MatInputModule,
    MatAutocompleteModule,
    MatOptionModule,
    CommonModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    FormsModule,
    MatButtonToggle,
    MatButtonToggleGroup,
    MatRadioButton,
    MatRadioModule,
  ],
  templateUrl: './create-order-page.component.html',
  styleUrl: './create-order-page.component.scss',
})
export class CreateOrderPageComponent implements OnInit {
  constructor(private router: Router, private _notifications: MatSnackBar) {}

  postOrderDTO: OrderRequestDTO = {} as OrderRequestDTO;

  // Item variables
  items: ItemRequestDTO[] = []; // Temporary storage for items
  itemTableDataSource = new MatTableDataSource<ItemRequestDTO>(this.items);
  orderItemFormConfig: FormConfig = ORDER_ITEM_FORM_CONFIG;
  orderItemFormGroup = new FormGroup({});
  orderItemColumns: TableColumn<ItemRequestDTO>[] = [
    { id: 'name', label: 'Artikelbezeichnung' },
    { id: 'quantity', label: 'Anzahl' },
    { id: 'price_per_unit', label: 'Stückpreis' },
    { id: 'comment', label: 'Kommentar' },
  ];
  orderItemTableActions: TableActionButton[] = [
    {
      id: 'delete',
      label: 'Delete',
      buttonType: 'filled',
      color: ButtonColor.WARN,
      action: (row: ItemRequestDTO) => this.deleteItem(row),
    },
  ];

  // Recipient address variables
  recipientAddressFormConfig: FormConfig = ORDER_ADDRESS_FORM_CONFIG;
  recipientAddressFormGroup = new FormGroup({});
  recipientAddressId?: number; // Save id of the selected recipient address for the post
  recipientHasPreferredAddress = false;
  recipientAddressOption: 'preferred' | 'existing' | 'new' = 'preferred';
  recipientInfoText = '';
  selectedRecipientPerson?: PersonResponseDTO;
  selectedInvoicePerson?: PersonResponseDTO;
  personControlRecipient = new FormControl<PersonResponseDTO | string>('', {
    nonNullable: false,
    updateOn: 'change',
    validators: [this.validatePersonSelection.bind(this)], // Custom validator to ensure a valid PersonResponseDTO is selected, as Angular's built-in requireSelection somehow blocks the onSelectionChange event
  });
  filteredPersonsRecipient!: Observable<PersonResponseDTO[]>;

  // Invoice address variables
  invoiceAddressFormConfig: FormConfig = ORDER_ADDRESS_FORM_CONFIG;
  invoiceAddressFormGroup = new FormGroup({});
  invoiceAddressId?: number; // Save id of the selected invoice address for the post
  invoiceHasPreferredAddress = false;
  invoiceAddressOption: 'preferred' | 'existing' | 'new' = 'preferred';
  invoiceInfoText = '';
  personControlInvoice = new FormControl<PersonResponseDTO | string>('', {
    nonNullable: false,
    updateOn: 'change',
    validators: [this.validatePersonSelection.bind(this)], // Custom validator to ensure a valid PersonResponseDTO is selected, as Angular's built-in requireSelection somehow blocks the onSelectionChange event
  });
  filteredPersonsInvoice!: Observable<PersonResponseDTO[]>;

  // Shared recipient/invoice address variables
  persons: PersonResponseDTO[] = []; // Store all persons locally for the autocomplete input
  addressTableDataSource: MatTableDataSource<AddressResponseDTO> =
    new MatTableDataSource<AddressResponseDTO>([]);
  addressTableColumns = [
    { id: 'id', label: 'ID' },
    { id: 'street', label: 'Straße' },
    { id: 'town', label: 'Stadt' },
    { id: 'postal_code', label: 'Postleitzahl' },
    { id: 'country', label: 'Land' },
  ];
  sameAsRecipient: boolean = true;

  // Quotation variables
  quotationFormConfig = ORDER_QUOTATION_FORM_CONFIG;
  quotationFormGroup = new FormGroup({});
  quotations: QuotationRequestDTO[] = [];
  quotationTableDataSource = new MatTableDataSource<QuotationRequestDTO>(
    this.quotations
  );
  orderQuotationColumns: TableColumn<QuotationRequestDTO>[] = [
    { id: 'index', label: 'Nummer' },
    { id: 'price', label: 'Preis' },
    { id: 'company_name', label: 'Anbieter' },
    { id: 'company_city', label: 'Ort' },
  ];
  orderQuotationTableActions: TableActionButton[] = [
    {
      id: 'delete',
      label: 'Delete',
      buttonType: 'filled',
      color: ButtonColor.WARN,
      action: (row: QuotationRequestDTO) => this.deleteQuotation(row),
    },
  ];

  async ngOnInit(): Promise<void> {
    // Load initial data for the VAT options field in the form
    const vatOptions = await VatSService.getAllVats();
    this.setDropdownVatOptions(vatOptions);

    // Initialize the person dropdown in the address form with data from the api
    // and set up filtering for the autocomplete inputs
    this.persons = await PersonsService.getAllPersons();
    this.filteredPersonsRecipient =
      this.personControlRecipient.valueChanges.pipe(
        startWith(''),
        map((value) => {
          const searchText =
            typeof value === 'string'
              ? value
              : this.displayPerson(value as PersonResponseDTO);

          return this._filter(searchText || '');
        })
      );
    this.filteredPersonsInvoice = this.personControlInvoice.valueChanges.pipe(
      startWith(''),
      map((value) => {
        const searchText =
          typeof value === 'string'
            ? value
            : this.displayPerson(value as PersonResponseDTO);

        return this._filter(searchText || '');
      })
    );
  }

  /**
   * Adds a new item to the locally stored items list and updates the table data source
   */
  onAddItem() {
    if (this.orderItemFormGroup.valid) {
      const newItem = this.orderItemFormGroup.value as ItemRequestDTO;
      this.items.push(newItem);
      this.itemTableDataSource.data = this.items; // Update the table data source
      this.orderItemFormGroup.reset(); // Formular zurücksetzen
    } else {
      this.orderItemFormGroup.markAllAsTouched(); // Markiere alle Felder als berührt, um Validierungsfehler anzuzeigen
    }
  }

  /**
   * Deletes an item from the locally stored items list and updates the table data source
   * @param item The item to be deleted from the items list
   */
  deleteItem(item: ItemRequestDTO) {
    this.items = this.items.filter((i) => i !== item);
    this.itemTableDataSource.data = this.items; // Aktualisiere die Datenquelle der Tabelle
  }

  /**
   * Sets the dropdown options for the VAT fields in the form
   * @param vatOptions The list of VAT options to set in the dropdown
   */
  private setDropdownVatOptions(vatOptions: VatResponseDTO[]) {
    // set options for dropdown fields
    this.orderItemFormConfig.fields.find(
      (field) => field.name === 'vat_value'
    )!.options = vatOptions.map((vat) => ({
      value: vat.value,
      label: `${vat.description} (${vat.value}%)`,
    }));
  }

  /**
   * Filters the list of persons based on the search string
   * @param search The search string to filter persons by
   * @returns The filtered list of persons
   */
  private _filter(search: string): PersonResponseDTO[] {
    const filterValue = search.toLowerCase();
    return this.persons.filter((p) =>
      `${p.name} ${p.surname}`.toLowerCase().includes(filterValue)
    );
  }

  /**
   * Controls how the person is displayed in the autocomplete input
   * @param person The person object or string to display
   * @returns The display string for the person
   */
  displayPerson(person: PersonResponseDTO | string): string {
    if (!person) return '';
    return typeof person === 'string'
      ? person
      : `${person.name} ${person.surname}`;
  }

  /**
   * Validates that the selected value is a valid PersonResponseDTO object with an id property
   * @param control The form control to validate
   * @returns A validation error object if invalid, or null if valid
   */
  validatePersonSelection(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    // Check if the value is an object and has an 'id' property
    if (value && typeof value === 'object' && 'id' in value) {
      return null; // ok
    }
    return { invalidPerson: true }; // No valid person selected
  }

  /** Handle selection of a person from the autocomplete options
   * @param person The selected person from the autocomplete dropdown
   * @param isRecipient Boolean flag indicating if the selected person is the recipient (true) or the invoice party (false)
   */
  async onPersonSelected(person: PersonResponseDTO, isRecipient: boolean) {
    // Locally track the selected person based on the context (recipient or invoice)
    if (isRecipient) {
      this.selectedRecipientPerson = person;
      this.personControlRecipient.setValue(person);
    } else {
      this.selectedInvoicePerson = person;
      this.personControlInvoice.setValue(person);
    }

    // Check if the selected person has a preferred address

    if (person.address_id) {
      const preferredAddress: AddressResponseDTO =
        await PersonsService.getPersonsAddress(person.id!);

      if (isRecipient) {
        this.recipientHasPreferredAddress = true;
        this.recipientAddressOption = 'preferred';
        this.recipientAddressId = preferredAddress.id;
        this.recipientAddressFormGroup.patchValue(preferredAddress);
        this.recipientAddressFormConfig.title =
          'Hinterlegte bevorzugte Adresse';
        this.recipientInfoText =
          'Für diese Person ist eine bevorzugte Adresse hinterlegt. Bitte überprüfen Sie die Daten im Formular unterhalb oder wählen Sie eine andere Option.';
        this.recipientAddressFormGroup.disable();
      } else {
        this.invoiceHasPreferredAddress = true;
        this.invoiceAddressOption = 'preferred';
        this.invoiceAddressId = preferredAddress.id;
        this.invoiceAddressFormGroup.patchValue(preferredAddress);
        this.invoiceAddressFormConfig.title = 'Hinterlegte bevorzugte Adresse';
        this.invoiceInfoText =
          'Für diese Person ist eine bevorzugte Adresse hinterlegt. Bitte überprüfen Sie die Daten im Formular unterhalb oder wählen Sie eine andere Option.';
        this.invoiceAddressFormGroup.disable();
      }
      this.addressTableDataSource.data =
        await PersonsService.getPersonsAddresses();
    }
  }

  /**
   * Add a new quotation to the locally stored quotations list and update the table data source
   */
  onAddQuotation() {
    if (this.quotationFormGroup.valid) {
      const newQuotation = this.quotationFormGroup.value as QuotationRequestDTO;
      this.quotations.push(newQuotation);
      this.quotationFormGroup.reset(); // Reset the form
    } else {
      this.quotationFormGroup.markAllAsTouched(); // Mark all fields as touched to show validation errors
    }
  }

  /**
   * Remove a quotation from the locally stored quotations list and update the table data source
   * @param quotation The quotation to be deleted
   */
  deleteQuotation(quotation: QuotationRequestDTO) {
    this.quotations = this.quotations.filter((q) => q !== quotation);
    this.quotationTableDataSource.data = this.quotations; // Update the table data source
  }

  /**
   * Handle selection of an address from the address table
   * @param address The selected address from the table
   * @param isRecipientAddress Boolean flag indicating if the address is for the recipient (true) or the invoice (false)
   */
  onAddressSelected(address: AddressResponseDTO, isRecipientAddress: boolean) {
    // Wird aufgerufen, wenn in der Adress-Tabelle eine Zeile ausgewählt wird
    if (isRecipientAddress) {
      this.recipientAddressFormGroup.patchValue(address);
      this.recipientAddressId = address.id;
    } else {
      this.invoiceAddressFormGroup.patchValue(address);
      this.invoiceAddressId = address.id;
    }
  }

  /** Handle change of address option (preferred, existing, new)
   * @param option The selected address option
   * @param isRecipient Boolean flag indicating if the option change is for the recipient (true) or the invoice (false)
   */
  onAddressOptionChange(option: string, isRecipient: boolean) {
    // Recipient address mode has changed
    if (isRecipient) {
      this.recipientAddressOption = option as any;

      if (option === 'preferred' && this.selectedRecipientPerson?.address_id) {
        PersonsService.getPersonsAddress(this.selectedRecipientPerson.id!).then(
          (addr) => this.recipientAddressFormGroup.patchValue(addr)
        );
        this.recipientInfoText =
          'Für diese Person ist eine bevorzugte Adresse hinterlegt. Bitte überprüfen Sie die Daten im Formular unterhalb.';
        this.recipientAddressFormConfig.title =
          'Hinterlegte bevorzugte Adresse';
        this.recipientAddressFormGroup.disable();
      } else if (option === 'existing') {
        this.recipientAddressFormGroup.reset();
        this.recipientAddressFormGroup.disable();
        this.recipientAddressFormConfig.title = 'Bestehende Adresse überprüfen';
        this.recipientInfoText = 'Adressdaten überprüfen';
      } else if (option === 'new') {
        this.recipientAddressFormGroup.reset();
        this.recipientAddressFormGroup.enable();
        this.recipientAddressFormConfig.title = 'Neue Adresse erstellen';
        this.recipientInfoText =
          'Neue Adresse erstellen: bitte Formular ausfüllen.';
      }
    }
    // Invoice address mode has changed
    else {
      this.invoiceAddressOption = option as any;

      if (option === 'preferred' && this.selectedInvoicePerson?.address_id) {
        PersonsService.getPersonsAddress(this.selectedInvoicePerson.id!).then(
          (addr) => this.invoiceAddressFormGroup.patchValue(addr)
        );
        this.invoiceInfoText =
          'Für diese Person ist eine bevorzugte Adresse hinterlegt. Bitte überprüfen Sie die Daten im Formular unterhalb.';
        this.invoiceAddressFormConfig.title = 'Hinterlegte bevorzugte Adresse';
        this.invoiceAddressFormGroup.disable();
      } else if (option === 'existing') {
        this.invoiceAddressFormGroup.reset();
        this.invoiceAddressFormGroup.disable();
        this.invoiceAddressFormConfig.title = 'Bestehende Adresse überprüfen';
        this.invoiceInfoText = 'Adressdaten überprüfen';
      } else if (option === 'new') {
        this.invoiceAddressFormGroup.reset();
        this.invoiceAddressFormGroup.enable();
        this.invoiceAddressFormConfig.title = 'Neue Adresse erstellen';
        this.invoiceInfoText =
          'Neue Adresse erstellen: bitte Formular ausfüllen.';
      }
    }
  }

  /**
   * Save the address form inputs locally in the postOrderDTO object
   * @returns A promise that resolves when the operation is complete
   */
  async locallySaveAddressFormInput() {
    // Set recipient and invoice person
    if (this.selectedRecipientPerson) {
      this.postOrderDTO.delivery_person_id = this.selectedRecipientPerson.id;
    }

    // Is the invoice address and person the same as the recipient address?
    if (this.sameAsRecipient) {
      this.postOrderDTO.invoice_person_id =
        this.postOrderDTO.delivery_person_id;
    }
    // If not, check if an invoice person has been selected
    else if (this.selectedInvoicePerson) {
      this.postOrderDTO.invoice_person_id = this.selectedInvoicePerson.id;
    } else {
      this._notifications.open(
        'Bitte wählen Sie eine Person für die Rechnungsadresse aus (Feld: Rechnungsadresse).',
        undefined,
        { duration: 3000 }
      );
      return;
    }

    // Handle address saving based on the selected addressModes

    // Delivery address
    if (this.recipientAddressOption === 'new') {
      this.recipientAddressFormGroup.markAllAsTouched();
      if (this.recipientAddressFormGroup.valid) {
        // If the form is valid, create a new address via the API and store the returned ID
        const newAddress: AddressRequestDTO = this.recipientAddressFormGroup
          .value as AddressRequestDTO;
        try {
          const createdAddress: AddressResponseDTO =
            await PersonsService.createPersonAddress(newAddress);
          this.postOrderDTO.delivery_address_id = createdAddress.id;
        } catch (error) {
          this._notifications.open(
            'Fehler beim Speichern der Lieferadresse. Bitte überprüfen Sie die Eingaben im Lieferadress-Formular und versuchen Sie es später erneut.',
            undefined,
            { duration: 3000 }
          );
        }
      } else {
        this._notifications.open(
          'Bitte überprüfen Sie die Eingaben im Lieferadress-Formular. Alle Pflichtfelder müssen ausgefüllt sein.',
          undefined,
          { duration: 3000 }
        );
      }
    } else if (this.recipientAddressOption === 'preferred') {
      // Use the stored selectedRecipientPerson to assign the preferred address to the delivery_address_id-field
      if (this.selectedRecipientPerson?.address_id) {
        this.postOrderDTO.delivery_address_id =
          this.selectedRecipientPerson.address_id;
      } else {
        this._notifications.open(
          'Fehler beim Laden der bevorzugten Lieferadresse. Die Adresse konnte nicht gefunden werden. Bitte wählen Sie eine andere Adresse oder versuchen Sie es später erneut.',
          undefined,
          { duration: 3000 }
        );
        return;
      }
    } else {
      // Use the address id stored in recipientAddressId to assign to the postOrderDTO
      if (this.recipientAddressId) {
        this.postOrderDTO.delivery_address_id = this.recipientAddressId;
      } else {
        this._notifications.open(
          'Bitte wählen Sie eine Lieferadresse aus der Tabelle aus (Lieferadresse).',
          undefined,
          { duration: 3000 }
        );
        return;
      }
    }


      // Invoice address
      if (this.sameAsRecipient) {
        this.postOrderDTO.invoice_address_id =
          this.postOrderDTO.delivery_address_id;
      } else {
        if (this.invoiceAddressOption === 'new') {
          this.invoiceAddressFormGroup.markAllAsTouched();
          if (this.invoiceAddressFormGroup.valid) {
            // If the form is valid, create a new address via the API and store the returned ID
            const newAddress: AddressRequestDTO = this.invoiceAddressFormGroup
              .value as AddressRequestDTO;
            try {
              const createdAddress: AddressResponseDTO =
                await PersonsService.createPersonAddress(newAddress);
              this.postOrderDTO.invoice_address_id = createdAddress.id;
            } catch (error) {
              this._notifications.open(
                'Fehler beim Speichern der Adresse. Bitte versuchen sie es später erneut.',
                undefined,
                { duration: 3000 }
              );
            }
          } else {
            this._notifications.open(
              'Bitte überprüfen Sie die Eingaben in dem Adressfeld.',
              undefined,
              { duration: 3000 }
            );
          }
        } else if (this.invoiceAddressOption === 'preferred') {
          if (this.selectedInvoicePerson?.address_id) {
            this.postOrderDTO.invoice_address_id =
              this.selectedInvoicePerson.address_id;
          } else {
            this._notifications.open(
              'Fehler beim Laden der bevorzugten Adresse. Die präferierte Adresse konnte nicht gefunden werden. Bitte versuchen sie es später erneut',
              undefined,
              { duration: 3000 }
            );
            return;
          }
        } else {
          if (this.invoiceAddressId) {
            this.postOrderDTO.invoice_address_id = this.invoiceAddressId;
          } else {
            this._notifications.open(
              'Bitte wählen Sie eine Adresse aus der Tabelle aus.',
              undefined,
              { duration: 3000 }
            );
            return;
          }
        }
      }
    }
  }
