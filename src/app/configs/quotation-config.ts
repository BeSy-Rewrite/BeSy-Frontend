import { FormConfig } from "../components/form-component/form-component.component";

export const QUOTATION_FORM_CONFIG: FormConfig = {
  title: 'Neues Vergleichsangebot hinzufügen',
  fields: [
    {
      name: 'supplier_id',
      label: 'Lieferant ID',
      type: 'number',
      required: true
    },
    {
      name: 'price',
      label: 'Preis',
      type: 'number',
      required: true
    },
    {
      name: 'quote_date',
      label: 'Datum',
      type: 'date',
      required: true
    },
    {
      name: 'index',
      label: 'Index',
      type: 'number',
      required: true
    }
  ]
};
