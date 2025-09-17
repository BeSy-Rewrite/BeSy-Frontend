import { AddressResponseDTO } from './../../../api/models/response-dtos/AddressResponseDTO';
import { Component } from '@angular/core';
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
import { GenericTableComponent } from '../../../components/generic-table/generic-table.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
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
import { map, Observable, startWith } from 'rxjs';
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
  constructor() {}

  items: ItemRequestDTO[] = []; // Zwischenspeicher für die Artikel
  itemTableDataSource = new MatTableDataSource<ItemRequestDTO>(this.items);

  orderItemFormConfig: FormConfig = ORDER_ITEM_FORM_CONFIG;
  orderItemFormGroup = new FormGroup({});

  recipientAddressFormConfig: FormConfig = ORDER_ADDRESS_FORM_CONFIG;
  recipientAddressFormGroup = new FormGroup({});
  invoiceAddressFormConfig: FormConfig = ORDER_ADDRESS_FORM_CONFIG;
  invoiceAddressFormGroup = new FormGroup({});
  addressTableDataSource: MatTableDataSource<AddressResponseDTO> =
    new MatTableDataSource<AddressResponseDTO>([]);
  addressTableColumns = [
    { id: 'id', label: 'ID' },
    { id: 'street', label: 'Straße' },
    { id: 'town', label: 'Stadt' },
    { id: 'postal_code', label: 'Postleitzahl' },
    { id: 'country', label: 'Land' },
  ];
  // State flags
  recipientHasPreferredAddress = false;
  invoiceHasPreferredAddress = false;
  sameAsRecipient: boolean = true;
  // Standard: preferred address
  recipientAddressOption: 'preferred' | 'existing' | 'new' = 'preferred';
  invoiceAddressOption: 'preferred' | 'existing' | 'new' = 'preferred';
  recipientInfoText = '';
  invoiceInfoText = '';
  selectedRecipientPerson?: PersonResponseDTO;
  selectedInvoicePerson?: PersonResponseDTO;

  personControl = new FormControl<PersonResponseDTO | string>('');
  persons: PersonResponseDTO[] = [];
  filteredPersons$!: Observable<PersonResponseDTO[]>;

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

  orderItemColumns: TableColumn<ItemRequestDTO>[] = [
    { id: 'name', label: 'Artikelbezeichnung' },
    { id: 'quantity', label: 'Anzahl' },
    { id: 'price_per_unit', label: 'Stückpreis' }, // This column is sortable by default
    { id: 'comment', label: 'Kommentar' }, // This column is not displayed
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

  async ngOnInit(): Promise<void> {
    // Load initial data for the VAT options field in the form
    const vatOptions = await VatSService.getAllVats();
    this.setDropdownOptions(vatOptions);

    this.persons = await PersonsService.getAllPersons();
    this.filteredPersons$ = this.personControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value))
    );
  }

  onAddItem() {
    if (this.orderItemFormGroup.valid) {
      const newItem = this.orderItemFormGroup.value as ItemRequestDTO;
      this.items.push(newItem);
      this.itemTableDataSource.data = this.items; // Aktualisiere die Datenquelle der Tabelle
      this.orderItemFormGroup.reset(); // Formular zurücksetzen
    } else {
      this.orderItemFormGroup.markAllAsTouched(); // Markiere alle Felder als berührt, um Validierungsfehler anzuzeigen
    }
  }

  deleteItem(item: ItemRequestDTO) {
    this.items = this.items.filter((i) => i !== item);
    this.itemTableDataSource.data = this.items; // Aktualisiere die Datenquelle der Tabelle
  }

  // Set dropdown options for the form fields
  private setDropdownOptions(vatOptions: VatResponseDTO[]) {
    // set options for dropdown fields
    this.orderItemFormConfig.fields.find(
      (field) => field.name === 'vat_value'
    )!.options = vatOptions.map((vat) => ({
      value: vat.value,
      label: `${vat.description} (${vat.value}%)`,
    }));
  }

  // Filter returned PersonResponseDTO
  private _filter(
    value: string | PersonResponseDTO | null
  ): PersonResponseDTO[] {
    const filterValue =
      typeof value === 'string'
        ? value.toLowerCase()
        : value
        ? `${value.name} ${value.surname}`.toLowerCase()
        : '';

    return this.persons.filter((person) =>
      `${person.name} ${person.surname}`.toLowerCase().includes(filterValue)
    );
  }

  // Controls how the person is displayed in the autocomplete input
  displayPerson(person: PersonResponseDTO): string {
    return person ? `${person.name} ${person.surname}` : '';
  }

  // Handle selection of a person from the autocomplete options
  async onPersonSelected(person: PersonResponseDTO, isRecipient: boolean) {
    if (isRecipient) {
      this.selectedRecipientPerson = person;
    } else {
      this.selectedInvoicePerson = person;
    }

    // Check if the selected person has a preferred address
    if (person.address_id) {
      this.recipientHasPreferredAddress = true;

      const preferredAddress: AddressResponseDTO =
        await PersonsService.getPersonsAddress(person.id!);

      if (isRecipient) {
        this.recipientAddressOption = 'preferred';
        this.recipientAddressFormGroup.patchValue(preferredAddress);
        this.recipientAddressFormConfig.title =
          'Hinterlegte bevorzugte Adresse';
        this.recipientInfoText =
          'Für diese Person ist eine bevorzugte Adresse hinterlegt. Bitte überprüfen Sie die Daten im Formular unterhalb oder wählen Sie eine andere Option.';
        this.recipientAddressFormGroup.disable();
      } else {
        this.invoiceAddressOption = 'preferred';
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

  onAddQuotation() {
    if (this.quotationFormGroup.valid) {
      const newQuotation = this.quotationFormGroup.value as QuotationRequestDTO;
      this.quotations.push(newQuotation);
      this.quotationFormGroup.reset(); // Reset the form
    } else {
      this.quotationFormGroup.markAllAsTouched(); // Mark all fields as touched to show validation errors
    }
  }

  deleteQuotation(quotation: QuotationRequestDTO) {
    this.quotations = this.quotations.filter((q) => q !== quotation);
    this.quotationTableDataSource.data = this.quotations; // Update the table data source
  }

  onAddressSelected(address: AddressResponseDTO) {
    // Wird aufgerufen, wenn in der Adress-Tabelle eine Zeile ausgewählt wird
    this.recipientAddressFormGroup.patchValue(address);
  }

  // Handle change of address option (preferred, existing, new)
  onAddressOptionChange(option: string, isRecipient: boolean) {
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
    } else {
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
}
