import { FormConfig } from "../../components/form-component/form-component.component";


export const ORDER_QUOTATION_FORM_CONFIG: FormConfig = {
  title: 'Neuen Artikel hinzufügen',
  fields: [
    {
      name: 'index',
      label: 'Index',
      type: 'number',
      required: true
    },
    {
      name: 'quote_date',
      label: 'Angebotsdatum',
      type: 'date',
      required: true
    },
    {
      name: 'price',
      label: 'Preis',
      type: 'number',
      required: true
    },
    {
      name: 'company_name',
      label: 'Firmenname',
      type: 'text',
      required: true
    },
    {
      name: 'company_city',
      label: 'Firmenstadt',
      type: 'text',
      required: true
    }
  ]
};
