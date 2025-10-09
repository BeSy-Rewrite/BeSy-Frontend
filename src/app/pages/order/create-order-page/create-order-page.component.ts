import { ORDER_QUERIES_PERSON_FORM_CONFIG } from './../../../configs/order/order-config';
import {
  PersonsWrapperService,
  PersonWithFullName,
} from './../../../services/wrapper-services/persons-wrapper.service';
import { VatWrapperService } from '../../../services/wrapper-services/vats-wrapper.service';
import {
  Component,
  ElementRef,
  ViewChild,
  Signal,
  signal,
  computed,
} from '@angular/core';
import { ProgressBarComponent } from '../../../components/progress-bar/progress-bar.component';
import { MatDivider } from '@angular/material/divider';
import {
  FormComponent,
  FormField,
} from '../../../components/form-component/form-component.component';
import { OnInit } from '@angular/core';
import { FormConfig } from '../../../components/form-component/form-component.component';
import { ORDER_ITEM_FORM_CONFIG } from '../../../configs/order/order-item-config';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
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
  AddressResponseDTO,
  ApprovalRequestDTO,
  CostCenterResponseDTO,
  CostCentersService,
  ItemRequestDTO,
  CurrencyResponseDTO,
  OrderRequestDTO,
  OrdersService,
  PersonResponseDTO,
  QuotationRequestDTO,
  VatResponseDTO,
  SupplierResponseDTO,
  CustomerIdResponseDTO,
} from '../../../api';
import {
  ORDER_ADDRESS_FORM_CONFIG,
  ORDER_APPROVAL_FORM_CONFIG,
  ORDER_COST_CENTER_FORM_CONFIG,
  ORDER_GENERAL_FORM_CONFIG,
  ORDER_MAIN_OFFER_FORM_CONFIG,
  ORDER_QUOTATION_FORM_CONFIG,
  ORDER_SUPPLIER_DECISION_REASON_FORM_CONFIG,
} from '../../../configs/order/order-config';
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
import {
  CurrenciesWrapperService,
  CurrencyWithDisplayName,
} from '../../../services/wrapper-services/currencies-wrapper.service';
import { SuppliersWrapperService } from '../../../services/wrapper-services/suppliers-wrapper.service';
import { OrdersWrapperService } from '../../../services/wrapper-services/orders-wrapper.service';
import { MatTabGroup, MatTabsModule } from '@angular/material/tabs';
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
  MatTabGroup,
  MatTabsModule,
],
  templateUrl: './create-order-page.component.html',
  styleUrl: './create-order-page.component.scss',
})
export class CreateOrderPageComponent implements OnInit {
  constructor(
    private router: Router,
    private _notifications: MatSnackBar,
    private personsWrapperService: PersonsWrapperService,
    private currenciesWrapperService: CurrenciesWrapperService,
    private suppliersWrapperService: SuppliersWrapperService,
    private orderWrapperService: OrdersWrapperService
  ) {}

  postOrderDTO: OrderRequestDTO = {} as OrderRequestDTO;

  // Item variables
  items = signal<ItemRequestDTO[]>([]);
  itemTableDataSource = new MatTableDataSource<ItemRequestDTO>([]);
  orderItemFormConfig: FormConfig = ORDER_ITEM_FORM_CONFIG;
  orderItemFormGroup = new FormGroup({});

  // Track the currently selected currency for formatting the total sum in the items table footer
  selectedCurrency = signal<{ code: string; symbol: string } | null>(null);
  // Compute the footer content for the items table, showing the total sum of all items
  footerContent = computed(() => {
    const sum = this.items().reduce((total, item) => {
      const price = item.price_per_unit ?? 0;
      const quantity = item.quantity ?? 0;

      const vat = Number(item.vat_value) || 0;
      const vatMultiplier = item.vat_type === 'netto' ? 1 + vat / 100 : 1;

      return total + price * quantity * vatMultiplier;
    }, 0);

    // Fallback to EUR if no currency is selected
    const currency = this.selectedCurrency()?.code ?? 'EUR';

    const formatted = new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency,
    }).format(sum);

    return `Gesamt: ${formatted}`;
  });

  orderItemColumns: TableColumn<ItemRequestDTO>[] = [
    { id: 'name', label: 'Artikelbezeichnung' },
    { id: 'quantity', label: 'Anzahl' },
    { id: 'comment', label: 'Kommentar' },
    {
      id: 'price_per_unit',
      label: 'Stückpreis',
      footerContent: this.footerContent,
    },
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
  recipientAddressId?: number; // Stores the id of the selected recipient preferred address for the post
  recipientHasPreferredAddress = false;
  recipientAddressOption: 'preferred' | 'existing' | 'new' = 'preferred';
  recipientInfoText = '';
  selectedRecipientAddressIdFromTable: number | undefined; // Stores the id of the selected recipient address from the table
  selectedRecipientPerson?: PersonWithFullName;
  selectedInvoicePerson?: PersonWithFullName;
  filteredPersonsRecipient: PersonWithFullName[] = [];
  @ViewChild('inputRecipient', { static: false })
  inputRecipient!: ElementRef<HTMLInputElement>;

  // Invoice address variables
  invoiceAddressFormConfig: FormConfig = ORDER_ADDRESS_FORM_CONFIG;
  invoiceAddressFormGroup = new FormGroup({});
  invoiceAddressId?: number; // Stores the id of the selected invoice person's preferred address
  invoiceHasPreferredAddress = false;
  invoiceAddressOption: 'preferred' | 'existing' | 'new' = 'preferred';
  invoiceInfoText = '';
  selectedInvoiceAddressIdFromTable: number | undefined; // Stores the id of the selected invoice address from the table
  filteredPersonsInvoice: PersonWithFullName[] = [];
  @ViewChild('inputInvoice', { static: false })
  inputInvoice!: ElementRef<HTMLInputElement>;

  // Queries person variables
  selectedQueryPerson?: PersonWithFullName;
  filteredPersonsQuery: PersonWithFullName[] = [];
  queriesPersonFormConfig = ORDER_QUERIES_PERSON_FORM_CONFIG;
  queriesPersonFormGroup = new FormGroup({});

  // Shared recipient/invoice address variables
  persons: PersonWithFullName[] = []; // Store all persons locally for the autocomplete input
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

  // Approval variables
  approvalFormConfig = ORDER_APPROVAL_FORM_CONFIG;
  approvalFormGroup = new FormGroup({});
  postApprovalDTO: ApprovalRequestDTO = {} as ApprovalRequestDTO;

  // Cost center variables
  costCenters: CostCenterResponseDTO[] = [];
  primaryCostCenterControl = new FormControl<CostCenterResponseDTO | string>(
    '',
    {
      nonNullable: false,
      updateOn: 'change',
      validators: [this.validateCostCentersSelection.bind(this)], // Custom validator to ensure a valid PersonResponseDTO is selected, as Angular's built-in requireSelection somehow blocks the onSelectionChange event
    }
  );
  filteredPrimaryCostCenters!: Observable<CostCenterResponseDTO[]>;

  secondaryCostCenterControl = new FormControl<CostCenterResponseDTO | string>(
    '',
    {
      nonNullable: false,
      updateOn: 'change',
      validators: [this.validateCostCentersSelection.bind(this)], // Custom validator to ensure a valid PersonResponseDTO is selected, as Angular's built-in requireSelection somehow blocks the onSelectionChange event
    }
  );
  filteredSecondaryCostCenters!: Observable<CostCenterResponseDTO[]>;

  // Currency variables
  currencies: Array<CurrencyWithDisplayName> = [];
  currenciesLoaded = false;

  // Main offer variables
  mainOfferFormConfig = ORDER_MAIN_OFFER_FORM_CONFIG;
  mainOfferFormGroup = new FormGroup({});
  suppliers: Array<SupplierResponseDTO> = []; // Will be loaded from API
  customerIds: Array<CustomerIdResponseDTO> = []; // Will be loaded from API

  // Supplier decision reason variables
  supplierDecisionReasonFormConfig = ORDER_SUPPLIER_DECISION_REASON_FORM_CONFIG;
  supplierDecisionReasonFormGroup = new FormGroup({});

  // General form variables
  generalFormConfig = ORDER_GENERAL_FORM_CONFIG;
  generalFormGroup = new FormGroup({});

  async ngOnInit(): Promise<void> {
    // Load initial data for the VAT options field in the form
    const vatOptions = await VatWrapperService.getAllVats();
    this.setDropdownVatOptions(vatOptions);

    // Initialize the person dropdown in the address form with data from the api
    // and set up filtering for the autocomplete inputs
    this.loadPersons();

    this.loadSuppliers();

    // Initialize the cost center form with data from the api
    this.costCenters = await CostCentersService.getCostCenters();
    this.filteredPrimaryCostCenters =
      this.primaryCostCenterControl.valueChanges.pipe(
        startWith(''),
        map((value) => {
          const searchText =
            typeof value === 'string'
              ? value
              : this.displayCostCenter(value as CostCenterResponseDTO);

          return this._filterCostCenters(searchText || '');
        })
      );
    console.log('Gefilterte Kostenstellen:', this.filteredPrimaryCostCenters);
    this.filteredSecondaryCostCenters =
      this.secondaryCostCenterControl.valueChanges.pipe(
        startWith(''),
        map((value) => {
          const searchText =
            typeof value === 'string'
              ? value
              : this.displayCostCenter(value as CostCenterResponseDTO);

          return this._filterCostCenters(searchText || '');
        })
      );
    // Fetch currencies from api
    this.currencies =
      await this.currenciesWrapperService.getAllCurrenciesWithSymbol();
    this.setCurrenciesDropdownOptions(this.currencies);
  }

  /**
   * Adds a new item to the locally stored items list and updates the table data source
   */
  onAddItem() {
    if (this.orderItemFormGroup.valid) {
      const newItem = this.orderItemFormGroup.value as ItemRequestDTO;
      console.log('Neuer Artikel:', newItem);
      this.items.update((curr) => [...curr, newItem]);
      this.itemTableDataSource.data = this.items(); // Update the table data source
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
    this.items.update((curr) => curr.filter((i) => i !== item));
    this.itemTableDataSource.data = this.items(); // Aktualisiere die Datenquelle der Tabelle
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
   * Loads all persons from the API and stores them in the component
   */
  private async loadPersons() {
    console.log('Loading persons...');
    this.persons = await this.personsWrapperService.getAllPersonsWithFullName();
    console.log('Geladene Personen:', this.persons);

    // fill the filteredPersons arrays with all persons initially for the autocomplete inputs
    this.filteredPersonsRecipient = this.persons.slice();
    this.filteredPersonsInvoice = this.persons.slice();
    this.filteredPersonsQuery = this.persons.slice();

    // Configure the config for the queries person autocomplete input, as this field is handled in a seperate form component
    const field = this.queriesPersonFormConfig.fields.find(
      (field) => field.name === 'queries_person_id'
    );
    if (!field) return;
    field.options = this.persons.map((person) => ({
      label: person.fullName, // Label shown in the dropdown of the autocomplete
      value: person.id, // value which is returned when selecting an option
    }));

  }

  /**
   * Filters the list of persons based on the search string
   * @param search The search string to filter persons by
   * @returns The filtered list of persons
   */
  private _filter(search: string): PersonWithFullName[] {
    const filterValue = search.toLowerCase(); // input string in the input field to lower case
    return this.persons.filter((p) =>
      `${p.name} ${p.surname}`.toLowerCase().includes(filterValue)
    );
  }

  /**
   * Controls how the person is displayed in the autocomplete input
   * @param person The person object or string to display
   * @returns The display string for the person
   */
  displayPerson(person: PersonWithFullName | string): string {
    if (!person) return '';
    return typeof person === 'string' ? person : person.fullName;
  }

  /** Handle selection of a person from the autocomplete options
   * @param person The selected person from the autocomplete dropdown
   * @param isRecipient Boolean flag indicating if the selected person is the recipient (true) or the invoice party (false)
   */
  async onPersonSelected(person: PersonWithFullName, isRecipient: boolean) {
    // Locally track the selected person based on the context (recipient or invoice)
    if (isRecipient) {
      this.selectedRecipientPerson = person;
    } else {
      this.selectedInvoicePerson = person;
    }

    // Check if the selected person has a preferred address

    if (person.address_id) {
      const preferredAddress: AddressResponseDTO =
        await this.personsWrapperService.getPersonAddressesById(person.id!);

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
      // Load all addresses of any person into the address table for selection
      this.addressTableDataSource.data =
        await this.personsWrapperService.getAllPersonsAddresses();
    }
  }

  /** Handle clearing of the autocomplete input
   * @param isRecipient Boolean flag indicating if the cleared input is for the recipient (true) or the invoice party (false)
   */
  onPersonCleared(isRecipient: boolean) {
      // Clear all locally stored data related to the previously selected person
      // and reset the address form and related variables
      if (isRecipient) {
        this.selectedRecipientPerson = undefined;
      this.recipientHasPreferredAddress = false;
      this.recipientAddressOption = 'preferred';
      this.recipientAddressId = undefined;
      this.recipientAddressFormGroup.reset();
      this.recipientInfoText = '';
      this.recipientAddressFormConfig.title =
        'Empfängeradresse auswählen oder erstellen';
    } else {
      this.selectedInvoicePerson = undefined;
      this.invoiceHasPreferredAddress = false;
      this.invoiceAddressOption = 'preferred';
      this.invoiceAddressId = undefined;
      this.invoiceAddressFormGroup.reset();
      this.invoiceInfoText = '';
      this.invoiceAddressFormConfig.title =
        'Rechnungsadresse auswählen oder erstellen';
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
      this.selectedRecipientAddressIdFromTable = address.id;
    } else {
      this.invoiceAddressFormGroup.patchValue(address);
      this.selectedInvoiceAddressIdFromTable = address.id;
    }
  }

  /** Handle change of address option (preferred, existing, new)
   * @param option The selected address option
   * @param isRecipient Boolean flag indicating if the option change is for the recipient (true) or the invoice (false)
   */
  onAddressOptionChange(option: string, isRecipient: boolean) {
    // Recipient address mode has changed
    if (isRecipient) {

      if ( option === 'preferred' && this.selectedRecipientPerson?.address_id ) {
        this.personsWrapperService
          .getPersonAddressesById( this.selectedRecipientPerson.id! )
          .then( ( addr ) => this.recipientAddressFormGroup.patchValue( addr ) );
        this.recipientInfoText =
          'Für diese Person ist eine bevorzugte Adresse hinterlegt. Bitte überprüfen Sie die Daten im Formular unterhalb.';
        this.recipientAddressFormConfig.title =
          'Hinterlegte bevorzugte Adresse';
        this.recipientAddressFormGroup.disable();
        if (this.selectedRecipientAddressIdFromTable && this.recipientAddressOption === 'existing') {
          this.selectedRecipientAddressIdFromTable = undefined; // Clear selected address if switching from existing to preferred
        }
      } else if ( option === 'existing' ) {
        this.recipientAddressFormGroup.reset();
        this.recipientAddressFormGroup.disable();
        this.recipientAddressFormConfig.title = 'Bestehende Adresse überprüfen';
        this.recipientInfoText = 'Adressdaten überprüfen';
      } else if ( option === 'new' ) {
        this.recipientAddressFormGroup.reset();
        this.recipientAddressFormGroup.enable();
        this.recipientAddressFormConfig.title = 'Neue Adresse erstellen';
        this.recipientInfoText =
          'Neue Adresse erstellen: bitte Formular ausfüllen.';
        if ( this.selectedRecipientAddressIdFromTable && this.recipientAddressOption === 'existing' ) {
          this.selectedRecipientAddressIdFromTable = undefined; // Clear selected address if switching from existing to new
        }
      }
      this.recipientAddressOption = option as any;
    }
    // Invoice address mode has changed
    else {

      if (option === 'preferred' && this.selectedInvoicePerson?.address_id) {
        this.personsWrapperService
          .getPersonAddressesById(this.selectedInvoicePerson.id!)
          .then((addr) => this.invoiceAddressFormGroup.patchValue(addr));
        this.invoiceInfoText =
          'Für diese Person ist eine bevorzugte Adresse hinterlegt. Bitte überprüfen Sie die Daten im Formular unterhalb.';
        this.invoiceAddressFormConfig.title = 'Hinterlegte bevorzugte Adresse';
        this.invoiceAddressFormGroup.disable();
        if(this.selectedInvoiceAddressIdFromTable && this.invoiceAddressOption === 'existing'){
          this.selectedInvoiceAddressIdFromTable = undefined; // Clear selected address if switching from existing to preferred
        }
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
        if(this.selectedInvoiceAddressIdFromTable && this.invoiceAddressOption === 'existing'){
          this.selectedInvoiceAddressIdFromTable = undefined; // Clear selected address if switching from existing to new
        }
      }
      this.invoiceAddressOption = option as any;
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

    // Recipient address
    if (this.recipientAddressOption === 'new') {
      this.recipientAddressFormGroup.markAllAsTouched();
      if (this.recipientAddressFormGroup.valid) {
        // If the form is valid, create a new address via the API and store the returned ID
        const newAddress: AddressRequestDTO = this.recipientAddressFormGroup
          .value as AddressRequestDTO;
        try {
          const createdAddress: AddressResponseDTO =
            await this.personsWrapperService.createPersonAddress(newAddress);
          this.postOrderDTO.delivery_address_id = createdAddress.id;
          this._notifications.open(
            'Neue Lieferadresse wurde gespeichert.',
            undefined,
            { duration: 3000 }
          );
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
      // Use the address id stored in selectedRecipientAddressId to assign to the postOrderDTO
      if (this.selectedRecipientAddressIdFromTable) {
        this.postOrderDTO.delivery_address_id = this.selectedRecipientAddressIdFromTable;
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
              await this.personsWrapperService.createPersonAddress(newAddress);
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
        if (this.selectedInvoiceAddressIdFromTable) {
          this.postOrderDTO.invoice_address_id = this.selectedInvoiceAddressIdFromTable;
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
    console.log('Recipient Address ID:', this.recipientAddressId);
    console.log('Invoice Address ID:', this.invoiceAddressId);
    console.log('PostOrderDTO:', this.postOrderDTO);
  }

  /** Save the approval form inputs locally in the postApprovalDTO object
   */
  locallySaveApprovalFormInput() {
    // Get raw form values and normalize undefined (unchecked) to false.
    // This prevents having to check whether a property has changed or not
    // when editing an order with existing approval flags.
    // E.g. if flagEdvPermission was true and the user unchecks it, the property
    // would be undefined in the form value and thus not included in the postApprovalDTO.
    // By normalizing undefined to false, we ensure that all flags are explicitly set.
    const raw = this.approvalFormGroup.value;
    const normalized = Object.fromEntries(
      Object.entries(raw).map(([k, v]) => [k, v ?? false])
    );

    this.postApprovalDTO = normalized as ApprovalRequestDTO;

    console.log(this.postApprovalDTO);
    this._notifications.open(
      'Zustimmungen wurden zwischengespeichert.',
      undefined,
      { duration: 3000 }
    );
  }

  onCostCenterSelected(costCenter: CostCenterResponseDTO, isPrimary: boolean) {
    if (isPrimary) {
      this.primaryCostCenterControl.setValue(costCenter);
      this.postOrderDTO.primary_cost_center_id = costCenter.id;
    } else {
      this.secondaryCostCenterControl.setValue(costCenter);
      this.postOrderDTO.secondary_cost_center_id = costCenter.id;
    }
  }

  private _filterCostCenters(search: string): CostCenterResponseDTO[] {
    const filterValue = search.toLowerCase();
    return this.costCenters.filter((cc) =>
      `${cc.name}`.toLowerCase().includes(filterValue)
    );
  }

  displayCostCenter(costCenter: CostCenterResponseDTO | string): string {
    if (!costCenter) return '';
    return typeof costCenter === 'string' ? costCenter : `${costCenter.name}`;
  }

  validateCostCentersSelection(
    control: AbstractControl
  ): ValidationErrors | null {
    const value = control.value;
    // Check if the value is an object and has an 'id' property
    if (value && typeof value === 'object' && 'id' in value) {
      return null; // ok
    }
    return { invalidCostCenter: true }; // No valid cost center selected
  }

  /**
   * Set the dropdown options for the currency fields in the form
   * @param currencies
   * @returns
   */
  private setCurrenciesDropdownOptions(
    currencies: Array<CurrencyWithDisplayName>
  ) {
    const mainOfferField = this.mainOfferFormConfig.fields.find(
      (f) => f.name === 'currency_short'
    );
    if (!mainOfferField) return;

    mainOfferField.options = currencies.map((c) => ({
      label: c.displayName ?? '', // Falls displayName undefined -> leere Zeichenkette
      value: c.code ?? '', // Falls code undefined -> leere Zeichenkette
    }));

    mainOfferField.defaultValue = currencies
      .filter((c) => c.code === 'EUR')
      .map((c) => ({
        label: c.displayName ?? '',
        value: c.code ?? '',
      }))[0];
    this.currenciesLoaded = !this.currenciesLoaded;
  }

  /**
   * Load all suppliers and set the dropdown options for the supplier_id field in the mainOfferFormConfig
   * @returns A promise that resolves when the suppliers have been loaded and the dropdown options set
   */
  private async loadSuppliers() {
    this.suppliers = await this.suppliersWrapperService.getAllSuppliers();
    const field = this.mainOfferFormConfig.fields.find(
      (f) => f.name === 'supplier_id'
    );
    if (!field) return;

    field.options = this.suppliers.map((s) => ({
      label: s.name ?? '', // Falls name undefined -> leere Zeichenkette
      value: s.id ?? 0, // Falls id undefined -> 0
    }));
  }

  /**
   * Handle changes in the main offer form group emited by the FormComponent
   * @param field The selected supplier with field name and value. Value can be either a number or null.
   */
  async onMainOfferFormGroupChanged(field: { field: string; value: any }) {
    console.log('MainOfferFormGroup changed:', field);
    // Check if the changed field is the supplier_id
    if (field.field === 'supplier_id' && field.value) {
      try {
        // Fetch customer IDs for the selected supplier
        this.customerIds = await this.loadCustomerIdsForSupplier(field.value);
        const customerIdField = this.mainOfferFormConfig.fields.find(
          (f) => f.name === 'customer_id'
        );
        if (customerIdField) {
          customerIdField.options = this.customerIds.map((c) => ({
            label: c.customer_id ?? '', // Falls customer_identifier undefined -> leere Zeichenkette
            value: c.customer_id ?? 0, // Falls id undefined -> 0
          }));
        }
      } catch (error) {
        console.error('Fehler beim Laden der Customer-IDs:', error);
        this.customerIds = []; // Fallback, damit die UI nicht crasht
      }
    }

    // Check if the changed field is the currency_short
    else if (field.field === 'currency_short' && field.value) {
      // Set the selected currency signal based on the selected value

      // Find the selected currency in the currencies array
      const selected = this.currencies.find((c) => c.code === (field.value?.value ?? field.value));

      // Update the selectedCurrency signal with the found currency or default to EUR
      this.selectedCurrency.set({
        code: selected?.code ?? 'EUR',
        symbol: selected?.symbol ?? '€',
      });
    }
  }

  /** Load customer IDs for a given supplier ID
   * @param supplierId The ID of the supplier to load customer IDs for
   * @returns A promise that resolves to an array of CustomerIdResponseDTO
   */
  async loadCustomerIdsForSupplier(supplierId: number) {
    const customerIds =
      await this.suppliersWrapperService.getCustomersIdsBySupplierId(
        supplierId
      );
    return customerIds;
  }

  /**
   * Dynamically adjust the supplier decision reason form config, based on the checked fields
   * @param field the changed field in the supplierDecisionFormConfig. Currently only listens to the field flag_decision_other_reasons
   * @returns
   */
  onSupplierDecisionReasonChanged(field: { field: string; value: any }) {
    // Check if the changed field is the supplier_decision_reason
    // If yes, either add it to the supplierDecisionReasonFormConfig or remove it
    if (field.field !== 'flag_decision_other_reasons') return;
    else {
      if (field.value == true) {
        // Add the decision_other_reason_description field if not already present
        if (
          !this.supplierDecisionReasonFormConfig.fields.find(
            (f) => f.name === 'supplier_decision_reason'
          )
        ) {
          this.supplierDecisionReasonFormConfig.fields.push({
            name: 'supplier_decision_reason',
            label: 'Begründung',
            type: 'textarea',
            required: true,
            placeholder: 'Geben Sie die Begründung ein',
          } as FormField);

          this.supplierDecisionReasonFormGroup.addControl(
            'supplier_decision_reason',
            new FormControl('', Validators.required)
          );
        }
      } else {
        // Remove the decision_other_reason_description field if it exists
        this.supplierDecisionReasonFormConfig.fields =
          this.supplierDecisionReasonFormConfig.fields.filter(
            (f) => f.name !== 'supplier_decision_reason'
          );

        if (
          this.supplierDecisionReasonFormGroup.get('supplier_decision_reason')
        ) {
          this.supplierDecisionReasonFormGroup.removeControl(
            'supplier_decision_reason'
          );
        }
      }
    }
  }

  /**
   * Filter persons for the recipient or invoice autocomplete input
   * @param isRecipient boolean flag indicating if the filtering is for the recipient (true) or invoice (false)
   */
  filterPersons(isRecipient: boolean): void {
  const inputEl = isRecipient
    ? this.inputRecipient.nativeElement
    : this.inputInvoice.nativeElement;

  const value = inputEl.value.trim().toLowerCase();

  // Wenn das Feld leer ist → Person-Cleared auslösen
  if (value === '') {
    this.onPersonCleared(isRecipient);
    if (isRecipient) {
      this.filteredPersonsRecipient = this.persons;
    } else {
      this.filteredPersonsInvoice = this.persons;
    }
    return;
  }

  // Normales Filtern
  const filtered = this.persons.filter((p) =>
    p.fullName.toLowerCase().includes(value)
  );

  if (isRecipient) {
    this.filteredPersonsRecipient = filtered;
  } else {
    this.filteredPersonsInvoice = filtered;
  }
}



  onQueriesPersonFormGroupChanged(field: { field: string; value: any }) {
    if (field.field === 'queries_person_id' && field.value) {
      this.selectedQueryPerson = field.value as PersonWithFullName;
      this.postOrderDTO.queries_person_id = this.selectedQueryPerson.id;
    }
  }

  async createOrder() {
    // Implement the logic to create the order
    this.generalFormGroup.markAllAsTouched();
    if (!this.generalFormGroup.valid) {
      this._notifications.open(
        'Bitte überprüfen Sie die Eingaben im Formular. Alle Pflichtfelder müssen ausgefüllt sein.',
        undefined,
        { duration: 3000 }
      );
      return;
    }


    const currencyValue = (this.mainOfferFormGroup.value as any)?.currency_short?.value ?? null;
    this.postOrderDTO = {
      ...this.postOrderDTO,
      ...this.generalFormGroup.value,
      ...this.supplierDecisionReasonFormGroup.value,
      ...this.approvalFormGroup.value,
      ...this.mainOfferFormGroup.value,
      ...this.queriesPersonFormGroup.value,
      currency_short: currencyValue,
    };
    console.log('PostOrderDTO vor Erstellung:', this.postOrderDTO);
    const createdOrder = await this.orderWrapperService.createOrder(
      this.postOrderDTO
    );
    if (createdOrder) {
      this.orderWrapperService.getOrderById(createdOrder.id!);
      this._notifications.open('Bestellung wurde erstellt.', undefined, {
        duration: 3000,
      });
      console.log('Erstellte Bestellung:', createdOrder);
    } else
      this._notifications.open(
        'Fehler beim Erstellen der Bestellung. Bitte versuchen Sie es später erneut.',
        undefined,
        { duration: 3000 }
      );
  }
}
