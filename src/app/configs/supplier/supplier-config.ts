import { Validators } from '@angular/forms';
import { FormConfig } from '../../components/form-component/form-component.component';

export const NOMINATIM_SEARCH_CONFIG: FormConfig = {
  fields: [
    {
      name: 'nominatim_search',
      label: 'Adresse suchen',
      type: 'search',
      required: false,
      nominatim_param: 'address',
      tooltip: 'Geben Sie eine Adresse ein, um nach passenden Treffern zu suchen.',
    },
  ],
};

// Supplier Configuration (matches SupplierRequestDTO)
export const SUPPLIER_FORM_CONFIG: FormConfig = {
  fields: [
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      required: true,
      nominatim_param: 'q', // Cannot be paired with any other address param!!!
      nominatim_field: 'name',
      editable: true,
      tooltip: 'Name des Lieferanten. Wird in der Lieferantenauswahl angezeigt.',
    },
    {
      name: 'flag_preferred',
      label: 'Vorzugslieferant',
      type: 'select',
      required: true,
      options: [
        { value: false, label: 'Nein' },
        { value: true, label: 'Ja' },
      ],
      editable: true,
    },
    {
      name: 'vat_id',
      label: 'USt-IdNr.',
      type: 'text',
      required: false,
      validators: [Validators.maxLength(20)],
      tooltip: 'Umsatzsteuer-Identifikationsnummer des Lieferanten.',
      editable: true,
    },
    {
      name: 'email',
      label: 'E-Mail',
      type: 'email',
      required: false,
      validators: [Validators.email],
      editable: true,
    },
    {
      name: 'fax',
      label: 'Fax',
      type: 'tel',
      required: false,
      editable: true,
      tooltip:
        'Faxnummer des Lieferanten. Bitte im internationalen Format angeben, z.B. +49 123 4567890',
    },
    {
      name: 'phone',
      label: 'Telefon',
      type: 'tel',
      required: false,
      editable: true,
      tooltip:
        'Telefonnummer des Lieferanten. Bitte im internationalen Format angeben, z.B. +49 123 4567890',
    },
    {
      name: 'comment',
      label: 'Kommentar',
      type: 'textarea',
      required: false,
      validators: [Validators.maxLength(255)],
      editable: true,
      tooltip: 'Interne Anmerkungen zum Lieferanten.',
    },
    {
      name: 'website',
      label: 'Website',
      type: 'text',
      required: false,
      editable: true,
      tooltip: 'Webseite des Lieferanten.',
    },
  ],
};
