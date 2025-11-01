import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  effect,
  OnInit,
  signal,
  WritableSignal
} from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButton } from '@angular/material/button';
import {
  MatButtonToggle,
  MatButtonToggleGroup,
} from '@angular/material/button-toggle';
import { MatOptionModule } from '@angular/material/core';
import { MatDivider } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioButton, MatRadioModule } from '@angular/material/radio';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { MatTabGroup, MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  AddressRequestDTO,
  AddressResponseDTO,
  ApprovalRequestDTO,
  ApprovalResponseDTO,
  CostCenterResponseDTO,
  OrderStatus,
  SupplierResponseDTO,
  VatResponseDTO
} from '../../../api';
import {
  FormComponent,
  FormConfig,
  FormField,
} from '../../../components/form-component/form-component.component';
import { GenericTableComponent } from '../../../components/generic-table/generic-table.component';
import { ProgressBarComponent } from '../../../components/progress-bar/progress-bar.component';
import {
  ORDER_ADDRESS_FORM_CONFIG,
  ORDER_APPROVAL_FORM_CONFIG,
  ORDER_DELIVERY_PERSON_FORM_CONFIG,
  ORDER_GENERAL_FORM_CONFIG,
  ORDER_INVOICE_PERSON_FORM_CONFIG,
  ORDER_MAIN_OFFER_FORM_CONFIG,
  ORDER_PRIMARY_COST_CENTER_FORM_CONFIG,
  ORDER_QUERIES_PERSON_FORM_CONFIG,
  ORDER_QUOTATION_FORM_CONFIG,
  ORDER_SECONDARY_COST_CENTER_FORM_CONFIG,
  ORDER_SUPPLIER_DECISION_REASON_FORM_CONFIG,
} from '../../../configs/order/order-config';
import { ORDER_ITEM_FORM_CONFIG } from '../../../configs/order/order-item-config';
import {
  ButtonColor,
  TableActionButton,
  TableColumn,
} from '../../../models/generic-table';
import { CostCenterWrapperService } from '../../../services/wrapper-services/cost-centers-wrapper.service';
import {
  CurrenciesWrapperService,
  CurrencyWithDisplayName,
} from '../../../services/wrapper-services/currencies-wrapper.service';
import {
  OrderResponseDTOFormatted,
  OrdersWrapperService,
} from '../../../services/wrapper-services/orders-wrapper.service';
import {
  PersonsWrapperService,
  PersonWithFullName,
} from '../../../services/wrapper-services/persons-wrapper.service';
import { SuppliersWrapperService } from '../../../services/wrapper-services/suppliers-wrapper.service';
import { VatWrapperService } from '../../../services/wrapper-services/vats-wrapper.service';

/**
 * Model for the items table used in the order edit/create page.
 * Intermediate model between ItemRequestDTO and ItemResponseDTO
 */
export interface ItemTableModel {
  item_id?: number;
  name: string;
  price_per_unit: string;
  quantity: number;
  quantity_unit?: string;
  article_id?: string;
  comment?: string;
  vat_value?: string; // aus RequestDTO
  vat?: VatResponseDTO; // aus ResponseDTO
  preferred_list?: 'RZ' | 'TA';
  preferred_list_number?: string;
  vat_type: 'netto' | 'brutto';
}

export const ORDER_EDIT_TABS = [
  'General',
  'MainOffer',
  'Items',
  'Quotations',
  'Addresses',
  'Approvals',
] as const;

/**
 * Model for the quotations table used in the order edit/create page
 */
export interface QuotationTableModel {
  index?: number;
  quote_date: string;
  price: string;
  company_name: string;
  company_city: string;
}

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
    MatIcon,
    RouterModule,
  ],
  templateUrl: './edit-order-page.component.html',
  styleUrl: './edit-order-page.component.scss',
})
export class EditOrderPageComponent implements OnInit {
  constructor(
    private router: Router,
    private _notifications: MatSnackBar,
    private personsWrapperService: PersonsWrapperService,
    private currenciesWrapperService: CurrenciesWrapperService,
    private suppliersWrapperService: SuppliersWrapperService,
    private orderWrapperService: OrdersWrapperService,
    private vatWrapperService: VatWrapperService,
    private costCenterWrapperService: CostCenterWrapperService,
    private route: ActivatedRoute
  ) {
    effect(() => {
      this.itemTableDataSource.data = this.items();
    });
    effect(() => {
      this.quotationTableDataSource.data = this.quotations();
    });
  }

  selectedTabIndex = signal<number>(0);
  // Define the order of the tabs
  private readonly tabOrder = ORDER_EDIT_TABS;

  // Mapping of tab names to their indices
  private readonly tabMap: Record<(typeof this.tabOrder)[number], number> = {
    General: 0,
    MainOffer: 1,
    Items: 2,
    Quotations: 3,
    Addresses: 4,
    Approvals: 5,
  };

  editOrderId!: number;
  formattedOrderDTO!: OrderResponseDTOFormatted;
  patchOrderDTO: OrderResponseDTOFormatted = {} as OrderResponseDTOFormatted;

  // Item variables
  items = signal<ItemTableModel[]>([]);
  private deletedItems: number[] = []; // Store IDs of deleted items for API call
  itemTableDataSource = new MatTableDataSource<ItemTableModel>([]);
  orderItemFormConfig: FormConfig = ORDER_ITEM_FORM_CONFIG;
  orderItemFormGroup = new FormGroup({});

  vatOptions: VatResponseDTO[] = [];
  // Track the currently selected currency for formatting the total sum in the items table footer
  selectedCurrency = signal<{ code: string; symbol: string } | null>(null);
  // Compute the footer content for the items table, showing the total sum of all items
  footerContent = computed(() => {
    const sum = this.items().reduce((total, item) => {
      const price =
        this.orderWrapperService.parseGermanPriceToNumber(
          item.price_per_unit
        ) ?? 0;
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

  orderItemColumns: TableColumn<ItemTableModel>[] = [
    { id: 'name', label: 'Artikelbezeichnung' },
    { id: 'quantity', label: 'Anzahl' },
    { id: 'vat_type', label: 'MwSt. Typ' },
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
      action: (row: ItemTableModel) => this.deleteItem(row),
    },
  ];

  // Recipient address variables
  deliveryAddressFormConfig: FormConfig = ORDER_ADDRESS_FORM_CONFIG;
  deliveryAddressFormGroup = new FormGroup({});
  deliveryAddressId?: number; // Stores the id of the selected recipient preferred address for the post
  deliveryPersonHasPreferredAddress: boolean = false;
  deliveryAddressOption: 'preferred' | 'existing' | 'new' | 'selected' =
    'selected';
  deliveryPersonHasExistingAddress: boolean = false;
  selectedDeliveryPerson: PersonWithFullName | undefined;
  deliveryInfoText = '';
  selectedDeliveryAddressIdFromTable: number | undefined; // Stores the id of the selected recipient address from the table
  isDeliveryPersonSelected: boolean = false;
  deliveryPersonFormConfig = ORDER_DELIVERY_PERSON_FORM_CONFIG;
  deliveryPersonFormGroup = new FormGroup({});
  deliveryPersonConfigRefreshTrigger = signal(0);
  selectedInvoicePerson?: PersonWithFullName;
  filteredPersonsRecipient: PersonWithFullName[] = [];

  // Invoice address variables
  invoiceAddressFormConfig: FormConfig = ORDER_ADDRESS_FORM_CONFIG;
  invoiceAddressFormGroup = new FormGroup({});
  invoiceAddressId?: number; // Stores the id of the selected invoice person's preferred address
  invoicePersonHasPreferredAddress: boolean = false;
  invoiceAddressOption: 'preferred' | 'existing' | 'new' | 'selected' =
    'selected';
  invoicePersonHasExistingAddress: boolean = false;
  invoiceInfoText = '';
  invoicePersonFormConfig = ORDER_INVOICE_PERSON_FORM_CONFIG;
  invoicePersonFormGroup = new FormGroup({});
  invoicePersonConfigRefreshTrigger = signal(0);
  selectedInvoiceAddressIdFromTable: number | undefined; // Stores the id of the selected invoice address from the table
  filteredPersonsInvoice: PersonWithFullName[] = [];

  // Queries person variables
  selectedQueryPersonId: number | undefined = undefined;
  filteredPersonsQuery: PersonWithFullName[] = [];
  queriesPersonFormConfig = ORDER_QUERIES_PERSON_FORM_CONFIG;
  queriesPersonFormGroup = new FormGroup({});
  // In deiner Component-Klasse:
  queriesPersonConfigRefreshTrigger = signal(0);

  // Shared recipient/invoice address variables
  personAddresses: AddressResponseDTO[] = [];
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
  quotations = signal<QuotationTableModel[]>([]);
  deletedQuotations: number[] = []; // Store IDs of deleted quotations for API call
  quotationTableDataSource = new MatTableDataSource<QuotationTableModel>([]);
  orderQuotationColumns: TableColumn<QuotationTableModel>[] = [
    { id: 'price', label: 'Preis' },
    { id: 'company_name', label: 'Anbieter' },
    { id: 'company_city', label: 'Ort' },
    { id: 'quote_date', label: 'Angebotsdatum' },
  ];
  orderQuotationTableActions: TableActionButton[] = [
    {
      id: 'delete',
      label: 'Delete',
      buttonType: 'filled',
      color: ButtonColor.WARN,
      action: (row: QuotationTableModel) => this.deleteQuotation(row),
    },
  ];

  // Approval variables
  approvalFormConfig = ORDER_APPROVAL_FORM_CONFIG;
  approvalFormGroup = new FormGroup({});
  approvals: ApprovalResponseDTO = {} as ApprovalResponseDTO;
  postApprovalDTO: ApprovalRequestDTO = {} as ApprovalRequestDTO;

  // Cost center variables
  costCenters: CostCenterResponseDTO[] = [];
  primaryCostCenterFormGroup = new FormGroup({});
  primaryCostCenterFormConfig = ORDER_PRIMARY_COST_CENTER_FORM_CONFIG;
  primaryCostCenterConfigRefreshTrigger = signal(0);

  secondaryCostCenterFormGroup = new FormGroup({});
  secondaryCostCenterFormConfig = ORDER_SECONDARY_COST_CENTER_FORM_CONFIG;
  secondaryCostCenterConfigRefreshTrigger = signal(0);

  // Currency variables
  currencies: Array<CurrencyWithDisplayName> = [];
  currenciesLoaded = false;

  // Main offer variables
  mainOfferFormConfig = ORDER_MAIN_OFFER_FORM_CONFIG;
  mainOfferFormGroup = new FormGroup({});
  suppliers: Array<SupplierResponseDTO> = []; // Will be loaded from API

  // Supplier decision reason variables
  supplierDecisionReasonFormConfig = ORDER_SUPPLIER_DECISION_REASON_FORM_CONFIG;
  supplierDecisionReasonFormGroup = new FormGroup({});
  mainOfferConfigRefreshTrigger = signal(0);

  // General form variables
  generalFormConfig = ORDER_GENERAL_FORM_CONFIG;
  generalFormGroup = new FormGroup({});

  // Progress bar variables
  currentProgressBarStepIndex = 3;

  async ngOnInit(): Promise<void> {
    // Load order data based on the id parameter in the route
    this.route.paramMap.subscribe(async (params) => {
      const id = Number(params.get('id'));

      // If id is not a number, navigate to not-found page
      if (isNaN(id)) {
        this.router.navigate(['/not-found'], { skipLocationChange: true });
        return;
      }

      try {
        // try to load the order data
        const formattedOrder = await this.orderWrapperService.getOrderById(id);
        this.editOrderId = id;
      } catch (error: any) {
        // Api-call returns 404 if order not found
        if (error?.status === 404) {
          this._notifications.open('Bestellung nicht gefunden', undefined, {
            duration: 5000,
          });
          this.router.navigate(['/not-found'], { skipLocationChange: true });
        } else {
          this._notifications.open(
            'Fehler beim Laden der Bestellung',
            undefined,
            { duration: 5000 }
          );
          console.error(error);
        }
      }
    });

    // Check for 'tab' query parameter to set the initial tab
    this.route.queryParamMap.subscribe((params) => {
      const requestedTab = params.get('tab');
      if (requestedTab && this.isTabName(requestedTab)) {
        this.switchToTab(requestedTab, { updateUrl: false });
      }
      else {
        this.switchToTab('General', { updateUrl: true });
      }
    });

    // Load initial data for form dropdowns and autocompletes
    [
      this.vatOptions,
      this.persons,
      this.suppliers,
      this.costCenters,
      this.currencies,
    ] = await Promise.all([
      this.vatWrapperService.getAllVats(),
      this.personsWrapperService.getAllPersonsWithFullName(),
      this.suppliersWrapperService.getAllSuppliers(),
      this.costCenterWrapperService.getAllCostCenters(),
      this.currenciesWrapperService.getAllCurrenciesWithSymbol(),
    ]);

    // Initialize form configurations with loaded data
    this.formatPersons();
    this.setDropdownVatOptions();
    this.formatSuppliers();
    this.formatCostCenters();
    this.setCurrenciesDropdownOptions();

    // Load all order data into the forms and tables
    this.loadAllOrderData();

  }
  /**
   * Adds a new item to the locally stored items list and updates the table data source
   */
  onAddItem() {
    if (this.orderItemFormGroup.valid) {
      const newItem = this.orderItemFormGroup.value as ItemTableModel;
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
  deleteItem(item: ItemTableModel) {
    // If the item has an item_id, it means it exists in the backend and should be deleted there as well
    if (item.item_id) {
      this.deletedItems.push(item.item_id);
    }
    this.items.update((curr) => curr.filter((i) => i !== item));
  }

  /**
   * Sets the dropdown options for the VAT fields in the form
   * @param vatOptions The list of VAT options to set in the dropdown
   */
  private setDropdownVatOptions() {
    // set options for dropdown fields
    this.orderItemFormConfig.fields.find(
      (field) => field.name === 'vat_value'
    )!.options = this.vatOptions.map((vat) => ({
      value: vat.value,
      label: `${vat.description} (${vat.value}%)`,
    }));
  }

  /**
   * Loads all persons from the API and stores them in the component
   */
  private formatPersons() {
    // Configure the config for the queries person autocomplete input, as this field is handled in a seperate form component
    const queriesPersonField = this.queriesPersonFormConfig.fields.find(
      (field) => field.name === 'queries_person_id'
    );
    if (!queriesPersonField) return;
    queriesPersonField.options = this.persons.map((person) => ({
      label: person.fullName, // Label shown in the dropdown of the autocomplete
      value: person.id, // value which is returned when selecting an option
    }));

    const deliveryPersonField = this.deliveryPersonFormConfig.fields.find(
      (field) => field.name === 'delivery_person_id'
    );
    if (!deliveryPersonField) return;
    deliveryPersonField.options = this.persons.map((person) => ({
      label: person.fullName,
      value: person.id,
    }));

    const invoicePersonField = this.invoicePersonFormConfig.fields.find(
      (field) => field.name === 'invoice_person_id'
    );
    if (!invoicePersonField) return;
    invoicePersonField.options = this.persons.map((person) => ({
      label: person.fullName,
      value: person.id,
    }));
  }

  /**
   * Updates the form configuration with the retrieved options.
   * @returns {Promise<void>}
   */
  private formatCostCenters() {
    const primaryCostCenterField = this.primaryCostCenterFormConfig.fields.find(
      (f) => f.name === 'primary_cost_center_id'
    );
    if (!primaryCostCenterField) return;

    primaryCostCenterField.options = this.costCenters.map((cc) => ({
      label: cc.name ?? '', // If name undefined -> empty string
      value: cc.id ?? 0, // If id undefined -> 0
    }));

    const secondaryCostCenterField =
      this.secondaryCostCenterFormConfig.fields.find(
        (f) => f.name === 'secondary_cost_center_id'
      );
    if (!secondaryCostCenterField) return;

    secondaryCostCenterField.options = this.costCenters.map((cc) => ({
      label: cc.name ?? '', // If name undefined -> empty string
      value: cc.id ?? 0, // If id undefined -> 0
    }));

    this.primaryCostCenterFormConfig = { ...this.primaryCostCenterFormConfig };
    this.secondaryCostCenterFormConfig = {
      ...this.secondaryCostCenterFormConfig,
    };
  }

  /**
   * Add a new quotation to the locally stored quotations list and update the table data source
   */
  onAddQuotation() {
    if (this.quotationFormGroup.valid) {
      const newQuotation = this.quotationFormGroup.value as QuotationTableModel;
      newQuotation.price = this.orderWrapperService.formatPriceToGerman(
        newQuotation.price
      );
      this.quotations.update((curr) => [...curr, newQuotation]);
      this.quotationFormGroup.reset(); // Reset the form
    } else {
      this.quotationFormGroup.markAllAsTouched(); // Mark all fields as touched to show validation errors
    }
  }

  /**
   * Remove a quotation from the locally stored quotations list and update the table data source
   * @param quotation The quotation to be deleted
   */
  deleteQuotation(quotation: QuotationTableModel) {
    // If the quotation has an id, it means it exists in the backend and should be deleted there as well
    if (quotation.index !== undefined) {
      this.deletedQuotations.push(quotation.index);
    }
    this.quotations.update((curr) => curr.filter((q) => q !== quotation));
  }

  /**
   *
   * @param person The event value of the autcomplete field
   * @param isRecipient Boolean indicating which addressPerson got selected
   * @returns
   */
  async onAddressPersonSelected(
    field: { field: string; value: any },
    isRecipient: boolean
  ) {
    const person = this.persons.filter((p) => p.id === field.value.value)[0];
    if (isRecipient) {
      this.selectedDeliveryPerson = person;
    } else {
      this.selectedInvoicePerson = person;
    }
    // Check if the selected person has a preferred address
    if (person.address_id) {
      const preferredAddress: AddressResponseDTO =
        await this.personsWrapperService.getPersonAddressesById(person.id!);

      if (isRecipient) {
        this.deliveryPersonHasPreferredAddress = true;
        this.deliveryAddressOption = 'preferred';
        this.deliveryAddressFormGroup.patchValue(preferredAddress);
        this.deliveryAddressFormConfig.subtitle = 'Hinterlegte bevorzugte Adresse';
        this.deliveryInfoText =
          'Für diese Person ist eine bevorzugte Adresse hinterlegt. Bitte überprüfen Sie die Daten im Formular unterhalb oder wählen Sie eine andere Option.';
        this.deliveryAddressFormGroup.disable();
      } else {
        this.invoicePersonHasPreferredAddress = true;
        this.invoiceAddressOption = 'preferred';
        this.invoiceAddressId = preferredAddress.id;
        this.invoiceAddressFormGroup.patchValue(preferredAddress);
        this.invoiceAddressFormConfig.subtitle = 'Hinterlegte bevorzugte Adresse';
        this.invoiceInfoText =
          'Für diese Person ist eine bevorzugte Adresse hinterlegt. Bitte überprüfen Sie die Daten im Formular unterhalb oder wählen Sie eine andere Option.';
        this.invoiceAddressFormGroup.disable();
      }
      // Load all addresses of any person into the address table for selection
      if (this.personAddresses.length === 0) {
        this.personAddresses =
          await this.personsWrapperService.getAllPersonsAddresses();
      }
      this.addressTableDataSource.data = this.personAddresses;
    }
  }

  /**
   * Handle selection of an address from the address table
   * @param address The selected address from the table
   * @param isRecipientAddress Boolean flag indicating if the address is for the recipient (true) or the invoice (false)
   */
  onAddressInTableSelected(
    address: AddressResponseDTO,
    isRecipientAddress: boolean
  ) {
    // Patch the selected address into the appropriate form group
    if (isRecipientAddress) {
      this.deliveryAddressFormGroup.patchValue(address);
      this.selectedDeliveryAddressIdFromTable = address.id;
    } else {
      this.invoiceAddressFormGroup.patchValue(address);
      this.selectedInvoiceAddressIdFromTable = address.id;
    }
  }

  /** Handle change of address option (preferred, existing, new, selected)
   * @param option The selected address option
   * @param isRecipient Boolean flag indicating if the option change is for the recipient (true) or the invoice (false)
   */
  onAddressOptionChanged(option: string, isRecipient: boolean) {
    // Delivery address mode has changed
    if (isRecipient) {
      if (option === 'preferred' && this.selectedDeliveryPerson?.address_id) {
        this.deliveryAddressFormGroup.enable();
        this.personsWrapperService
          .getPersonAddressesById(this.selectedDeliveryPerson.id!)
          .then((addr) => this.deliveryAddressFormGroup.patchValue(addr));
        this.deliveryInfoText =
          'Für diese Person ist eine bevorzugte Adresse hinterlegt. Bitte überprüfen Sie die Daten im Formular unterhalb.';
        this.deliveryAddressFormConfig.subtitle = 'Hinterlegte bevorzugte Adresse';
        this.deliveryAddressFormGroup.disable();
        if (
          this.selectedDeliveryAddressIdFromTable &&
          this.deliveryAddressOption === 'selected'
        ) {
          this.selectedDeliveryAddressIdFromTable = undefined; // Clear selected address if switching from existing to preferred
        }
      } else if (option === 'selected') {
        this.deliveryAddressFormGroup.reset();
        this.deliveryAddressFormGroup.disable();
        this.deliveryAddressFormConfig.subtitle = 'Bestehende Adresse überprüfen';
        this.deliveryInfoText =
          'Wählen Sie eine Adresse aus der Tabelle aus und überprüfen Sie die Daten im Formular unterhalb.';
      } else if (option === 'new') {
        this.deliveryAddressFormGroup.reset();
        this.deliveryAddressFormGroup.enable();
        this.deliveryAddressFormConfig.subtitle = 'Neue Adresse erstellen';
        this.deliveryInfoText =
          'Neue Adresse erstellen: bitte Formular ausfüllen.';
        if (
          this.selectedDeliveryAddressIdFromTable &&
          this.deliveryAddressOption === 'selected'
        ) {
          this.selectedDeliveryAddressIdFromTable = undefined; // Clear selected address in the table if switching from selected to new
        }
      } else if (
        option === 'existing' &&
        this.deliveryPersonHasExistingAddress
      ) {
        this.deliveryAddressFormGroup.reset();
        this.deliveryAddressFormGroup.enable();
        this.personsWrapperService
          .getPersonAddressesById(this.formattedOrderDTO.delivery_address_id!)
          .then((addr) => this.deliveryAddressFormGroup.patchValue(addr));
        this.deliveryAddressFormGroup.disable();
        this.deliveryAddressFormConfig.subtitle = 'Aktuell gespeicherte Adresse';
        this.deliveryInfoText =
          'Dies ist die aktuell gespeicherte Lieferadresse dieser Person. Sie können die Daten im Formular unterhalb überprüfen.';
        if (
          this.selectedDeliveryAddressIdFromTable &&
          this.deliveryAddressOption === 'selected'
        ) {
          this.selectedDeliveryAddressIdFromTable = undefined; // Clear selected address in the table if switching from selected to new
        }
      }
    }
    // Invoice address mode has changed
    else {
      if (option === 'preferred' && this.selectedInvoicePerson?.address_id) {
        this.personsWrapperService
          .getPersonAddressesById(this.selectedInvoicePerson.id!)
          .then((addr) => this.invoiceAddressFormGroup.patchValue(addr));
        this.invoiceInfoText =
          'Für diese Person ist eine bevorzugte Adresse hinterlegt. Bitte überprüfen Sie die Daten im Formular unterhalb.';
        this.invoiceAddressFormConfig.subtitle = 'Hinterlegte bevorzugte Adresse';
        this.invoiceAddressFormGroup.disable();
        if (
          this.selectedInvoiceAddressIdFromTable &&
          this.invoiceAddressOption === 'selected'
        ) {
          this.selectedInvoiceAddressIdFromTable = undefined; // Clear selected address if switching from selected to preferred
        }
      } else if (option === 'selected') {
        this.invoiceAddressFormGroup.reset();
        this.invoiceAddressFormGroup.disable();
        this.invoiceAddressFormConfig.subtitle = 'Bestehende Adresse überprüfen';
        this.invoiceInfoText = 'Adressdaten überprüfen';
      } else if (option === 'new') {
        this.invoiceAddressFormGroup.reset();
        this.invoiceAddressFormGroup.enable();
        this.invoiceAddressFormConfig.subtitle = 'Neue Adresse erstellen';
        this.invoiceInfoText =
          'Neue Adresse erstellen: bitte Formular ausfüllen.';
        if (
          this.selectedInvoiceAddressIdFromTable &&
          this.invoiceAddressOption === 'selected'
        ) {
          this.selectedInvoiceAddressIdFromTable = undefined; // Clear selected address in the table if switching from selected to new
        }
      } else if (
        option === 'existing' &&
        this.invoicePersonHasExistingAddress
      ) {
        this.invoiceAddressFormGroup.reset();
        this.invoiceAddressFormGroup.enable();
        this.personsWrapperService
          .getPersonAddressesById(this.formattedOrderDTO.invoice_address_id!)
          .then((addr) => this.invoiceAddressFormGroup.patchValue(addr));
        this.invoiceAddressFormGroup.disable();
        this.invoiceAddressFormConfig.subtitle = 'Aktuell gespeicherte Adresse';
        this.invoiceInfoText =
          'Dies ist die aktuell gespeicherte Rechnungsadresse dieser Person. Sie können die Daten im Formular unterhalb überprüfen.';
        if (
          this.selectedInvoiceAddressIdFromTable &&
          this.invoiceAddressOption === 'selected'
        ) {
          this.selectedInvoiceAddressIdFromTable = undefined; // Clear selected address in the table if switching from selected to new
        }
      }
    }
  }

  /**
   * Save the address form inputs locally in the postOrderDTO object
   * @returns {Promise<boolean>} Returns true if the address saving process was successful, false otherwise
   */
  async patchAddressOrder(): Promise<boolean> {
    // Set recipient and invoice person
    if (this.selectedDeliveryPerson) {
      // retrieve selected recipient person from autocomplete input from field delivery_person_id
      this.patchOrderDTO.delivery_person_id =
        this.deliveryPersonFormGroup.get('delivery_person_id')!.value;
    }

    // Is the invoice address and person the same as the recipient address?
    if (this.sameAsRecipient) {
      this.patchOrderDTO.invoice_person_id =
        this.patchOrderDTO.delivery_person_id;
    }
    // If not, check if an invoice person has been selected
    else if (this.selectedInvoicePerson) {
      this.patchOrderDTO.invoice_person_id =
        this.invoicePersonFormGroup.get('invoice_person_id')!.value;
    } else {
      this._notifications.open(
        'Bitte wählen Sie eine Person für die Rechnungsadresse aus (Feld: Rechnungsadresse).',
        undefined,
        { duration: 3000 }
      );
      return false;
    }

    // Handle address saving based on the selected addressModes

    // If the address options didn't change, return
    if (this.deliveryAddressOption === 'existing' && this.sameAsRecipient)
      return true;
    else if (
      this.deliveryAddressOption === 'existing' &&
      this.invoiceAddressOption === 'existing'
    )
      return true;

    // Recipient address
    if (this.deliveryAddressOption === 'new') {
      this.deliveryAddressFormGroup.markAllAsTouched();
      if (this.deliveryAddressFormGroup.valid) {
        // If the form is valid, create a new address via the API and store the returned ID
        const newAddress: AddressRequestDTO = this.deliveryAddressFormGroup
          .value as AddressRequestDTO;
        try {
          const createdAddress: AddressResponseDTO =
            await this.personsWrapperService.createPersonAddress(newAddress);
          this.patchOrderDTO.delivery_address_id = createdAddress.id;
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
    } else if (this.deliveryAddressOption === 'preferred') {
      // Use the stored selectedRecipientPerson to assign the preferred address to the delivery_address_id-field
      if (this.selectedDeliveryPerson?.address_id) {
        this.patchOrderDTO.delivery_address_id =
          this.selectedDeliveryPerson.address_id;
      } else {
        this._notifications.open(
          'Fehler beim Laden der bevorzugten Lieferadresse. Die Adresse konnte nicht gefunden werden. Bitte wählen Sie eine andere Adresse oder versuchen Sie es später erneut.',
          undefined,
          { duration: 3000 }
        );
        return false;
      }
    } else {
      // Use the address id stored in selectedRecipientAddressId to assign to the postOrderDTO
      if (this.selectedDeliveryAddressIdFromTable) {
        this.patchOrderDTO.delivery_address_id =
          this.selectedDeliveryAddressIdFromTable;
      } else {
        this._notifications.open(
          'Bitte wählen Sie eine Lieferadresse aus der Tabelle aus (Lieferadresse).',
          undefined,
          { duration: 3000 }
        );
        return false;
      }
    }

    // Invoice address
    if (this.sameAsRecipient) {
      this.patchOrderDTO.invoice_address_id =
        this.patchOrderDTO.delivery_address_id;
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
            this.patchOrderDTO.invoice_address_id = createdAddress.id;
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
          this.patchOrderDTO.invoice_address_id =
            this.selectedInvoicePerson.address_id;
        } else {
          this._notifications.open(
            'Fehler beim Laden der bevorzugten Adresse. Die präferierte Adresse konnte nicht gefunden werden. Bitte versuchen sie es später erneut',
            undefined,
            { duration: 3000 }
          );
          return false;
        }
      } else {
        if (this.selectedInvoiceAddressIdFromTable) {
          this.patchOrderDTO.invoice_address_id =
            this.selectedInvoiceAddressIdFromTable;
        } else {
          this._notifications.open(
            'Bitte wählen Sie eine Adresse aus der Tabelle aus.',
            undefined,
            { duration: 3000 }
          );
          return false;
        }
      }
    }
    return true;
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

  /**
   * Set the dropdown options for the currency fields in the form
   * @param currencies
   * @returns
   */
  private setCurrenciesDropdownOptions() {
    const mainOfferField = this.mainOfferFormConfig.fields.find(
      (f) => f.name === 'currency_short'
    );
    if (!mainOfferField) return;

    mainOfferField.options = this.currencies.map((c) => ({
      label: c.displayName ?? '', // Falls displayName undefined -> leere Zeichenkette
      value: c.code ?? '', // Falls code undefined -> leere Zeichenkette
    }));

    mainOfferField.defaultValue = this.currencies
      .filter((c) => c.code === 'EUR')
      .map((c) => ({
        label: c.displayName ?? '',
        value: c.code ?? '',
      }))[0];
    this.mainOfferConfigRefreshTrigger.update((n) => n + 1);
  }

  /**
   * Load all suppliers and set the dropdown options for the supplier_id field in the mainOfferFormConfig
   * @returns A promise that resolves when the suppliers have been loaded and the dropdown options set
   */
  private formatSuppliers() {
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
    // Check if the changed field is the supplier_id
    console.log('Main Offer Form Field changed');
    if (field.field === 'supplier_id' && field.value) {
      this.setCustomerIdsForSupplier(field.value?.value);
    } else if (field.field === 'supplier_id' && !field.value) {
      // If supplier is deselected, clear customer IDs
      const customerIdField = this.mainOfferFormConfig.fields.find(
        (f) => f.name === 'customer_id'
      );
      if (customerIdField) {
        customerIdField.options = [];
      }
    }

    // Check if the changed field is the currency_short
    else if (field.field === 'currency_short' && field.value) {
      // Set the selected currency signal based on the selected value

      // Find the selected currency in the currencies array
      const selected = this.currencies.find(
        (c) => c.code === (field.value?.value ?? field.value)
      );

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
  async setCustomerIdsForSupplier(supplierId: number) {
    try {
      // Fetch customer IDs for the selected supplier
      const customerIds =
        await this.suppliersWrapperService.getCustomersIdsBySupplierId(
          supplierId
        );
      const customerIdField = this.mainOfferFormConfig.fields.find(
        (f) => f.name === 'customer_id'
      );
      if (customerIdField) {
        customerIdField.options = customerIds.map((c) => ({
          label: c.customer_id ?? '', // Falls customer_identifier undefined -> leere Zeichenkette
          value: c.customer_id ?? 0, // Falls id undefined -> 0
        }));
      }
    } catch (error) {
      console.error('Fehler beim Laden der Customer-IDs:', error);
      const customerIdField = this.mainOfferFormConfig.fields.find(
        (f) => f.name === 'customer_id'
      );
      if (customerIdField) {
        customerIdField.options = [
          { label: 'Fehler beim Laden der Customer-IDs', value: undefined },
        ];
      }
    }
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
            (f) => f.name === 'decision_other_reasons_description'
          )
        ) {
          this.supplierDecisionReasonFormConfig.fields.push({
            name: 'decision_other_reasons_description',
            label: 'Begründung',
            type: 'textarea',
            required: true,
            placeholder: 'Geben Sie die Begründung ein',
          } as FormField);

          this.supplierDecisionReasonFormGroup.addControl(
            'decision_other_reasons_description',
            new FormControl('', Validators.required)
          );
        }
      } else {
        // Remove the decision_other_reason_description field if it exists
        this.supplierDecisionReasonFormConfig.fields =
          this.supplierDecisionReasonFormConfig.fields.filter(
            (f) => f.name !== 'decision_other_reasons_description'
          );

        if (
          this.supplierDecisionReasonFormGroup.get('decision_other_reasons_description')
        ) {
          this.supplierDecisionReasonFormGroup.removeControl(
            'decision_other_reasons_description'
          );
        }
      }
    }
  }

  /**
   * Loads all necessary order data, including formatted order details, items, and quotations.
   * Then formats the order data for form input.
   * @returns {Promise<void>}
   */
  private async loadAllOrderData() {
    if (!this.editOrderId) return;

    const [formattedOrder, mappedItems, quotations, approvals] =
      await Promise.all([
        this.orderWrapperService.getOrderByIDInFormFormat(this.editOrderId),

        this.orderWrapperService
          .getOrderItems(this.editOrderId)
          .then((responseItems) =>
            this.orderWrapperService.mapItemResponseToTableModel(responseItems)
          ),

        this.orderWrapperService
          .getOrderQuotations(this.editOrderId)
          .then((responseQuotations) =>
            this.orderWrapperService.mapQuotationResponseToTableModel(
              responseQuotations
            )
          ),

        this.orderWrapperService.getOrderApprovals(this.editOrderId),
      ]);

    this.quotations.set(quotations);
    this.formattedOrderDTO = formattedOrder;
    this.items.set(mappedItems);
    this.approvals = approvals;

    this.formatOrderForFormInput();
  }

  private formatOrderForFormInput() {
    this.patchGeneralFormGroupFromOrder();
    this.patchMainOfferFormGroupFromOrder();
    this.patchAddressFormsWithOrderData();
    this.patchApprovalFormGroupFromOrder();
  }

  /**
   * Patch the general form group with the loaded order data
   */
  patchGeneralFormGroupFromOrder() {
    this.generalFormGroup.patchValue(this.formattedOrderDTO);

    // Patch autocomplete fields in the form configs with the loaded order data
    this.patchConfigAutocompleteFieldsWithOrderData(
      'queries_person_id',
      this.formattedOrderDTO.queries_person_id,
      { current: this.queriesPersonFormConfig },
      this.queriesPersonConfigRefreshTrigger
    );
    this.patchConfigAutocompleteFieldsWithOrderData(
      'primary_cost_center_id',
      this.formattedOrderDTO.primary_cost_center_id,
      { current: this.primaryCostCenterFormConfig },
      this.primaryCostCenterConfigRefreshTrigger
    );
    this.patchConfigAutocompleteFieldsWithOrderData(
      'secondary_cost_center_id',
      this.formattedOrderDTO.secondary_cost_center_id,
      { current: this.secondaryCostCenterFormConfig },
      this.secondaryCostCenterConfigRefreshTrigger
    );
  }

  private patchMainOfferFormGroupFromOrder() {
    this.mainOfferFormGroup.patchValue(this.formattedOrderDTO);
    this.supplierDecisionReasonFormGroup.patchValue(this.formattedOrderDTO);

    this.patchConfigAutocompleteFieldsWithOrderData(
      'supplier_id',
      this.formattedOrderDTO.supplier_id,
      { current: this.mainOfferFormConfig },
      this.mainOfferConfigRefreshTrigger
    );

    if (this.formattedOrderDTO.currency) {
      this.patchConfigAutocompleteFieldsWithOrderData(
        'currency_short',
        this.formattedOrderDTO.currency,
        { current: this.mainOfferFormConfig },
        this.mainOfferConfigRefreshTrigger
      );
    }

    // Set customer_id dropdown options based on the loaded supplier_id
    /* if (this.formattedOrderDTO.supplier_id) {
      this.setCustomerIdsForSupplier(
        this.formattedOrderDTO.supplier_id.value as number
      );
    } */
  }

  private patchConfigAutocompleteFieldsWithOrderData(
    fieldName: string,
    value: any,
    configRef: { current: FormConfig },
    refreshTrigger: WritableSignal<number>
  ) {
    const fieldConfig = configRef.current.fields.find(
      (f) => f.name === fieldName
    );
    if (!fieldConfig) return;

    fieldConfig.defaultValue = value;
    refreshTrigger.update((v) => v + 1); // Trigger a refresh by updating the signal
  }

  private patchApprovalFormGroupFromOrder() {
    this.approvalFormGroup.patchValue(this.formattedOrderDTO);
  }

  /**
   * Revert all changes made to the order and reset the forms to its default state
   *! ToDO: Implement the reset functionality
   */
  private onResetToDefault() {
    // Empty items and quotations marked as to be deleted
    this.deletedItems = [];
    this.deletedQuotations = [];
  }

  /**
   * Decide how to setup the address forms based on the loaded order data
   */
  private async patchAddressFormsWithOrderData() {
    if (this.personAddresses.length === 0) {
      this.personAddresses =
        await this.personsWrapperService.getAllPersonsAddresses();
      this.addressTableDataSource.data = this.personAddresses;
    }
    // If any of the address fields are set, display them instead of the forms
    if (this.formattedOrderDTO.delivery_person_id) {
      this.patchConfigAutocompleteFieldsWithOrderData(
        'delivery_person_id',
        this.formattedOrderDTO.delivery_person_id,
        { current: this.deliveryPersonFormConfig },
        this.deliveryPersonConfigRefreshTrigger
      );
      this.selectedDeliveryPerson = this.persons.find(
        (p) => p.id === this.formattedOrderDTO.delivery_person_id?.value
      );
      if (this.selectedDeliveryPerson?.address_id) {
        this.deliveryPersonHasPreferredAddress = true;
      }
    }
    if (this.formattedOrderDTO.delivery_address_id) {
      const deliveryAddress =
        await this.personsWrapperService.getPersonAddressesById(
          this.formattedOrderDTO.delivery_address_id!
        );
      this.deliveryPersonHasExistingAddress = true;
      this.deliveryAddressFormGroup.patchValue(deliveryAddress);
      this.deliveryAddressFormConfig.subtitle =
        'Aktuell gespeicherte Lieferadresse';
      this.deliveryAddressOption = 'existing';
      this.deliveryAddressFormGroup.disable();
      this.deliveryInfoText =
        'Dies ist die aktuell gespeicherte Lieferaddresse dieser Person. Sie können die Daten im Formular unterhalb überprüfen.';
    }

    // If invoice person is set and different from delivery person, or the invoice address is different from the delivery address, set sameAsRecipient to false
    if (
      (this.formattedOrderDTO.invoice_person_id &&
        this.formattedOrderDTO.delivery_person_id &&
        this.formattedOrderDTO.invoice_person_id.value !==
        this.formattedOrderDTO.delivery_person_id.value) ||
      (this.formattedOrderDTO.invoice_address_id &&
        this.formattedOrderDTO.invoice_address_id !==
        this.formattedOrderDTO.delivery_address_id)
    ) {
      this.sameAsRecipient = false;
    }

    if (this.formattedOrderDTO.invoice_person_id) {
      this.patchConfigAutocompleteFieldsWithOrderData(
        'invoice_person_id',
        this.formattedOrderDTO.invoice_person_id,
        { current: this.invoicePersonFormConfig },
        this.invoicePersonConfigRefreshTrigger
      );
      this.selectedInvoicePerson = this.persons.find(
        (p) => p.id === this.formattedOrderDTO.invoice_person_id?.value
      );
      if (this.selectedInvoicePerson?.address_id) {
        this.invoicePersonHasPreferredAddress = true;
      }
    }
    if (this.formattedOrderDTO.invoice_address_id) {
      const invoiceAddress =
        await this.personsWrapperService.getPersonAddressesById(
          this.formattedOrderDTO.invoice_address_id!
        );
      this.invoiceAddressFormGroup.patchValue(invoiceAddress);
      this.invoiceAddressFormConfig.subtitle = 'Aktuell gespeicherte Adresse';
      this.invoiceAddressOption = 'existing';
      this.invoiceAddressFormGroup.disable();
      this.invoiceInfoText =
        'Dies ist die aktuell gespeicherte Rechnungsadresse dieser Person. Sie können die Daten im Formular unterhalb überprüfen.';
    }
  }

  private isTabName(value: string): value is (typeof this.tabOrder)[number] {
    return (this.tabOrder as readonly string[]).includes(value);
  }

  /**
   * Switches to the specified tab.
   * @param tabName The name of the tab to switch to.
   */
  switchToTab(
    tabName: (typeof this.tabOrder)[number],
    options: { updateUrl?: boolean } = {}
  ) {
    const index = this.tabMap[tabName];
    if (index !== undefined) {
      this.selectedTabIndex.set(index);
      if (options.updateUrl !== false) {
        this.updateTabQueryParam(tabName);
      }
    }
  }

  onTabIndexChange(index: number) {
    const tabName = this.tabOrder[index];
    if (tabName) {
      this.switchToTab(tabName);
    }
  }

  private updateTabQueryParam(tabName: (typeof this.tabOrder)[number]) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: tabName },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  /**
   * Gets the next tab name based on the current tab.
   * @param current The current tab name as string
   * @returns The next tab name or null if there is no next tab
   */
  private getNextTab(
    current: (typeof this.tabOrder)[number]
  ): (typeof this.tabOrder)[number] | null {
    const currentIndex = this.tabOrder.indexOf(current);
    const next = this.tabOrder[currentIndex + 1];
    return next ?? null;
  }

  /**
   * Patches the order with the data from the form based on the form type.
   *
   * @param formType String indicating which part of the order to patch
   */
  async patchOrderFromForm(
    formType:
      | 'General'
      | 'MainOffer'
      | 'Items'
      | 'Quotations'
      | 'Addresses'
      | 'Approvals'
      | 'All'
  ) {
    this.patchOrderDTO = this.formattedOrderDTO;

    const formOrder = [
      'General',
      'MainOffer',
      'Items',
      'Quotations',
      'Addresses',
      'Approvals',
    ] as const;

    const formsToPatch = formType === 'All' ? formOrder : [formType];

    for (const form of formsToPatch) {
      const success = await this.executeFormPatch(form);

      if (!success) {
        // Non valid form, switch to the tab and abort
        this.switchToTab(form);
        return;
      }
    }

    console.log('FormatOrderDTO vor Patch:', this.formattedOrderDTO);
    console.log('Finales Patch DTO:', this.patchOrderDTO);
    // Submit the order patch after all forms have been processed
    await this.submitOrderPatch();

    // Switch to the next tab if applicable
    if (formType !== 'All' && formType !== 'Approvals') {
      const nextTab = this.getNextTab(formType);
      if (nextTab) {
        this.switchToTab(nextTab);
      }
    }
  }

  private async executeFormPatch(
    formType: Exclude<Parameters<typeof this.patchOrderFromForm>[0], 'All'>
  ): Promise<boolean> {
    switch (formType) {
      case 'General':
        return this.patchGeneralOrder();

      case 'MainOffer':
        return this.patchMainOfferOrder();

      case 'Items':
        return this.patchItemsOrder();

      case 'Quotations':
        return this.patchQuotationsOrder();

      case 'Addresses':
        return this.patchAddressOrder();

      case 'Approvals':
        return this.submitApprovalPatch();

      default:
        return true;
    }
  }

  patchGeneralOrder(): boolean {
    if (
      !this.generalFormGroup.valid &&
      !this.primaryCostCenterFormGroup.valid &&
      !this.secondaryCostCenterFormGroup.valid &&
      !this.queriesPersonFormGroup.valid
    ) {
      this.generalFormGroup.markAllAsTouched();
      return false;
    }
    this.patchOrderDTO = {
      ...this.patchOrderDTO,
      ...this.generalFormGroup.value,
      primary_cost_center_id: this.primaryCostCenterFormGroup.get(
        'primary_cost_center_id'
      )?.value,
      secondary_cost_center_id: this.secondaryCostCenterFormGroup.get(
        'secondary_cost_center_id'
      )?.value,
      queries_person_id:
        this.queriesPersonFormGroup.get('queries_person_id')?.value,
    };
    return true;
  }

  patchMainOfferOrder(): boolean {
    if (!this.mainOfferFormGroup.valid) {
      this.mainOfferFormGroup.markAllAsTouched();
      return false;
    }
    this.patchOrderDTO = {
      ...this.patchOrderDTO,
      ...this.mainOfferFormGroup.value,
      ...this.supplierDecisionReasonFormGroup.value,
      supplier_id: this.mainOfferFormGroup.get('supplier_id')?.value,
      currency: this.mainOfferFormGroup.get('currency_short')?.value,
    };
    return true;
  }

  async patchItemsOrder(): Promise<boolean> {
    // prepare items that need to be created (no item_id -> new)
    const itemsToCreate = this.items()
      .filter((item) => !item.item_id)
      .map((item) =>
        this.orderWrapperService.mapItemTableModelToItemRequestDTO(item)
      );

    // create all new items if any got added
    if (itemsToCreate.length > 0) {
      try {
        await this.orderWrapperService.createOrderItems(
          this.editOrderId,
          itemsToCreate
        );
      } catch (error) {
        console.error('Fehler beim Erstellen von Items:', error);
        this._notifications.open(
          'Fehler beim Erstellen von Artikeln. Bitte versuchen Sie es später erneut.',
          undefined,
          { duration: 5000 }
        );
        return false;
      }

      // refresh items from backend if any were created
      try {
        const updatedItems = await this.orderWrapperService.getOrderItems(
          this.editOrderId
        );
        this.items.set(
          this.orderWrapperService.mapItemResponseToTableModel(updatedItems)
        );
      } catch (error) {
        console.error('Fehler beim Laden aktualisierter Items:', error);
        this._notifications.open(
          'Fehler beim Aktualisieren der Artikelliste. Bitte versuchen Sie es später erneut.',
          undefined,
          { duration: 5000 }
        );
        return false;
      }
    }

    // delete items marked for deletion, bail out on first failure
    for (const deletedItemId of this.deletedItems) {
      try {
        await this.orderWrapperService.deleteItemOfOrder(
          this.editOrderId,
          deletedItemId
        );
      } catch (error) {
        console.error('Fehler beim Löschen eines Artikels:', error);
        this._notifications.open(
          'Fehler beim Löschen eines Artikels. Bitte versuchen Sie es später erneut.',
          undefined,
          { duration: 5000 }
        );
        return false;
      }
    }

    // all requests succeeded
    // clear deletedItems since they've been removed on the backend
    this.deletedItems = [];
    return true;
  }

  async patchQuotationsOrder(): Promise<boolean> {
    // prepare quotations that need to be created (no quotation_index -> new)
    const quotationsToCreate = this.quotations()
      .filter((quotation) => !quotation.index)
      .map((quotation) =>
        this.orderWrapperService.mapQuotationTableModelToQuotationRequestDTO(
          quotation
        )
      );
    // create all new quotations if any got added
    if (quotationsToCreate.length > 0) {
      try {
        await this.orderWrapperService.createOrderQuotations(
          this.editOrderId,
          quotationsToCreate
        );
      } catch (error) {
        console.error('Fehler beim Erstellen von Angeboten:', error);
        this._notifications.open(
          'Fehler beim Erstellen von Angeboten. Bitte versuchen Sie es später erneut.',
          undefined,
          { duration: 5000 }
        );
        return false;
      }

      // refresh quotations from backend if any were created
      if (quotationsToCreate.length > 0) {
        try {
          const updatedQuotations =
            await this.orderWrapperService.getOrderQuotations(this.editOrderId);
          this.quotations.set(
            this.orderWrapperService.mapQuotationResponseToTableModel(
              updatedQuotations
            )
          );
        } catch (error) {
          console.error('Fehler beim Laden aktualisierter Angebote:', error);
          this._notifications.open(
            'Fehler beim Aktualisieren der Angebotsliste. Bitte versuchen Sie es später erneut.',
            undefined,
            { duration: 5000 }
          );
          return false;
        }
      }

      // delete quotations marked for deletion, bail out on first failure
      for (const deletedQuotationIndex of this.deletedQuotations) {
        try {
          await this.orderWrapperService.deleteQuotationOfOrder(
            this.editOrderId,
            deletedQuotationIndex
          );
        } catch (error) {
          console.error('Fehler beim Löschen eines Angebots:', error);
          this._notifications.open(
            'Fehler beim Löschen eines Angebots. Bitte versuchen Sie es später erneut.',
            undefined,
            { duration: 5000 }
          );
          return false;
        }
      }
    }

    // all requests succeeded
    // clear deletedQuotations since they've been removed on the backend
    this.deletedQuotations = [];
    return true;
  }

  /**
   * Submits the approval patch to the backend.
   * @returns {Promise<boolean>} Returns true if the patch was successful, false otherwise.
   */
  private async submitApprovalPatch(): Promise<boolean> {
    // If order is not in status completed, the approvals can't be changed
    if (this.formattedOrderDTO.status !== OrderStatus.COMPLETED) return true;

    this.locallySaveApprovalFormInput();
    // Send the approval patch to the backend
    try {
      await this.orderWrapperService.patchOrderApprovals(
        this.editOrderId,
        this.postApprovalDTO
      );
      this._notifications.open(
        'Zustimmungen wurden erfolgreich gespeichert.',
        undefined,
        { duration: 3000 }
      );
      return true;
    } catch (error) {
      console.error('Fehler beim Speichern der Zustimmungen:', error);
      this._notifications.open(
        'Fehler beim Speichern der Zustimmungen. Bitte versuchen Sie es später erneut.',
        undefined,
        { duration: 5000 }
      );
      return false;
    }
  }

  // ToDo!: Implement order patching
  private async submitOrderPatch() {
    // Check which fields have been modified and prepare the patch DTO accordingly
    const changedFields =
      this.orderWrapperService.compareOrdersAndReturnChangedFields(
        this.formattedOrderDTO,
        this.patchOrderDTO
      );
    console.log('Changed fields to be patched:', changedFields);

    // If no fields have changed, return
    if (Object.keys(changedFields).length === 0) {
      return;
    }


    try {
      this.formattedOrderDTO =
        await this.orderWrapperService.mapOrderResponseToFormatted(
          await this.orderWrapperService.patchOrderById(
            this.formattedOrderDTO!.id!,
            changedFields
          )
        );
      this._notifications.open(
        'Bestellung wurde erfolgreich aktualisiert.',
        undefined,
        { duration: 3000 }
      );
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Bestellung:', error);
      this._notifications.open(
        'Fehler beim Aktualisieren der Bestellung. Bitte versuchen Sie es später erneut.',
        undefined,
        { duration: 5000 }
      );
    }
  }
}
