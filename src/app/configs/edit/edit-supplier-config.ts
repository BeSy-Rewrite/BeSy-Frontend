import { Validators } from "@angular/forms";
import { FormConfig } from "../../components/form-component/form-component.component";

// Supplier Configuration (matches SupplierRequestDTO)
export const EDIT_SUPPLIER_FORM_CONFIG: FormConfig = {
  title: 'Bestehende Lieferantendaten',
  fields: [
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      required: true,
      nominatim_param: 'q', // Cannot be paired with any other address param!!!
      nominatim_field: 'name'
    },
    {
      name: 'flag_preferred',
      label: 'Vorzugslieferant',
      type: 'select',
      required: true,
      options: [
        { value: false, label: 'Nein' },
        { value: true, label: 'Ja' }
      ],
    },
    {
      name: 'vat_id',
      label: 'Mehrwertsteuersatz',
      type: 'select',
      required: false,
      options: [
        {value: 'error_loading_from_api', label: 'Fehler beim Laden der Optionen'}
      ],
      tooltip: 'Bitte wählen Sie den Mehrwertsteuersatz aus.'
    },
    {
      name: 'email',
      label: 'E-Mail',
      type: 'email',
      required: false,
      validators: [Validators.email]
    },
    {
      name: 'fax',
      label: 'Fax',
      type: 'tel',
      required: false
    },
    {
      name: 'phone',
      label: 'Telefon',
      type: 'tel',
      required: false
    },
    {
      name: 'comment',
      label: 'Kommentar',
      type: 'textarea',
      required: false,
      validators: [Validators.maxLength(255)]
    },
    {
      name: 'website',
      label: 'Website',
      type: 'text',
      required: false,
    },

    {
      name: 'customer_id',
      label: 'Kundennummer',
      type: 'text',
      required: false,
      tooltip: 'Interne oder vom Lieferanten vergebene Kundennummer. Diese wird später zum Erstellen einer Bestellungen benötigt. Falls möglich bitte angeben.'
    }
  ]
};
