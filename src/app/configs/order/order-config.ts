import { FormConfig } from '../../components/form-component/form-component.component';
import { Validators } from '@angular/forms';


export const ORDER_ADDRESS_FORM_CONFIG: FormConfig = {
  title: '2. Präferierte Adresse festlegen',
  fields: [
    {
      name: 'street',
      label: 'Straßenname',
      type: 'text',
      required: true,
      nominatim_param: 'street',
      nominatim_field: 'road',
      editable: false
    },
    {
      name: 'building_number',
      label: 'Hausnummer',
      type: 'text',
      required: false,
      nominatim_param: 'street',
      nominatim_field: 'house_number',
      editable: false
    },
    {
      name: 'building_name',
      label: 'Gebäudename',
      type: 'text',
      required: false,
      editable: false
    },
    {
      name: 'town',
      label: 'Stadt',
      type: 'text',
      required: true,
      nominatim_param: 'city',
      nominatim_field: 'town',
      editable: false
    },
    {
      name: 'postal_code',
      label: 'PLZ',
      type: 'text',
      required: true,
      nominatim_param: 'postalcode',
      nominatim_field: 'postcode',
      editable: false
    },
    {
      name: 'county',
      label: 'Region',
      type: 'text',
      required: false,
      nominatim_param: 'county',
      nominatim_field: 'county',
      editable: false
    },
    {
      name: 'country',
      label: 'Land',
      type: 'text',
      required: true,
      nominatim_param: 'country',
      nominatim_field: 'country',
      editable: false
    },
    {
      name: 'comment',
      label: 'Kommentar',
      type: 'text',
      required: false,
      editable: false
    }
  ]
};

export const ORDER_QUOTATION_FORM_CONFIG: FormConfig = {
  title: 'Vergleichsangebot hinzufügen',
  fields: [
    {
      name: 'index',
      label: 'Index',
      type: 'number',
      required: true,
      editable: true
    },
    {
      name: 'quote_date',
      label: 'Datum des Vergleichsangebots',
      type: 'date',
      required: true,
      editable: true
    },
    {
      name: 'price',
      label: 'Preis',
      type: 'number',
      required: true,
      editable: true,
      //validators: [Validators.pattern('^\\d+,\\d{2}$')]
    },
    {
      name: 'company_name',
      label: 'Unternehmensname',
      type: 'text',
      required: true,
      editable: true
    },
    {
      name: 'company_city',
      label: 'Unternehmensstadt',
      type: 'text',
      required: true,
      editable: true
    }
  ]
}
