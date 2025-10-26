import { FormConfig } from '../../components/form-component/form-component.component';
import { Validators } from '@angular/forms';

export const ORDER_ITEM_FORM_CONFIG: FormConfig = {
  title: 'Neuen Artikel hinzufügen',
  fields: [
    {
      name: 'name',
      label: 'Artikelbezeichnung',
      type: 'text',
      required: true,
    },
    {
      name: 'price_per_unit',
      label: 'Stückpreis',
      type: 'number',
      required: true,
      validators: [Validators.pattern(/^\d+([.,]\d{2})?$/)], // Validates numbers with optional two decimal places (comma as separator)
    },
    {
      name: 'vat_type',
      label: 'Preisart',
      type: 'radio',
      required: true,
      options: [
        { label: 'Netto', value: 'netto' },
        { label: 'Brutto', value: 'brutto' },
      ],
      defaultValue: 'brutto',
      tooltip: 'Geben Sie an, ob der Stückpreis als Netto- oder Bruttopreis verstanden werden soll.',
    },
    {
      name: 'quantity',
      label: 'Anzahl',
      type: 'number',
      required: true,
      defaultValue: 1,
      validators: [Validators.min(1), Validators.pattern(/^\d+$/)],
    },
    {
      name: 'quantity_unit',
      label: 'Einheit',
      type: 'autocomplete',
      requireSelection: true,
      required: false,
      filterable: true,
      // Will be loaded from currencies api
      options:[],
      defaultValue: { label: 'Euro', value: 'EUR' }
    },

    {
      name: 'vat_value',
      label: 'Mehrwertsteuersatz',
      type: 'select',
      required: true,
      // Will be loaded from API: vats
      options: [
        { label: 'Fehler beim Laden der Mehrwertsteuersätze', value: undefined },
      ],
    },
    {
      name: 'comment',
      label: 'Kommentar',
      type: 'textarea',
      required: false,
      validators: [Validators.maxLength(255)]
    },
  ],
};
