import { Validators } from "@angular/forms";
import { FormConfig } from "../components/form-component/form-component.component";

// Supplier Configuration (matches SupplierRequestDTO)
export const SUPPLIER_FORM_CONFIG: FormConfig = {
  title: 'Neuen Lieferanten hinzufügen',
  subtitle: 'Lieferantendaten eingeben',
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
      label: 'VAT ID',
      type: 'text',
      required: false
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
      type: 'text',
      required: false
    },
    {
      name: 'website',
      label: 'Website',
      type: 'text',
      required: false
    }
  ]
};
