import { Validators } from "@angular/forms";
import { FormConfig } from "../components/form-component/form-component.component";

// Supplier Configuration (matches SupplierRequestDTO)
export const SUPPLIER_FORM_CONFIG: FormConfig = {
  title: '1. Neuen Lieferanten hinzufügen',
  subtitle: 'Lieferantendaten eingeben',
  fields: [
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      required: true,
      nominatim_param: 'q', // Cannot be paired with any other address param!!!
      nominatim_field: 'name',
      editable: false
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
      editable: false
    },
    {
      name: 'vat_id',
      label: 'Mehrwertsteuersatz',
      type: 'select',
      required: false,
      options: [
        {value: 'error_loading_from_api', label: 'Fehler beim Laden der Optionen'}
      ],
      tooltip: 'Bitte wählen Sie den Mehrwertsteuersatz aus.',
      editable: false
    },
    {
      name: 'email',
      label: 'E-Mail',
      type: 'email',
      required: false,
      validators: [Validators.email],
      editable: false
    },
    {
      name: 'fax',
      label: 'Fax',
      type: 'tel',
      required: false,
      editable: false
    },
    {
      name: 'phone',
      label: 'Telefon',
      type: 'tel',
      required: false,
      editable: false
    },
    {
      name: 'comment',
      label: 'Kommentar',
      type: 'text',
      required: false,
      editable: false
    },
    {
      name: 'website',
      label: 'Website',
      type: 'text',
      required: false,
      editable: false
    },
  ]
};
