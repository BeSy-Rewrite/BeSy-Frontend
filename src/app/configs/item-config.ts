import { FormConfig } from "../components/form-component/form-component.component";

// Item Configuration (matches ItemRequestDTO)
export const ITEM_FORM_CONFIG: FormConfig = {
  title: 'Neue Bestellposition hinzufügen',
  fields: [
    {
      name: 'quantity',
      label: 'Menge',
      type: 'number',
      required: false
    },
    {
      name: 'article_id',
      label: 'Artikelnummer',
      type: 'text',
      required: false
    },
    {
      name: 'name',
      label: 'Beschreibung',
      type: 'text',
      required: true
    },
    {
      name: 'vat_value',
      label: 'MwSt.',
      type: 'select',
      required: true,
      // Will be loaded from API: vats
      options: []
    },
    {
      name: 'vat_type',
      label: 'Eingabeformat',
      type: 'select',
      required: true,
      options: [
        { value: 'netto', label: 'netto' },
        { value: 'brutto', label: 'brutto' }
      ]
    },
    {
      name: 'price_per_unit',
      label: 'Preis pro Einheit',
      type: 'number',
      required: true
    },
    {
      name: 'quantity_unit',
      label: 'Mengeneinheit',
      type: 'text',
      required: false
    },
    {
      name: 'preferred_list',
      label: 'Vorzugsliste',
      type: 'select',
      required: false,
      // Will be loaded from API: preferred_lists
      options: []
    },
    {
      name: 'preferred_list_number',
      label: 'Vorzugslistennummer',
      type: 'text',
      required: false
    },
    {
      name: 'comment',
      label: 'Kommentar',
      type: 'text',
      required: false
    }
  ]
};
