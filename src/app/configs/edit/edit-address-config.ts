import { AddressConfig } from "../../components/address-form/address-form.component";

export const EDIT_ADDRESS_FORM_CONFIG: AddressConfig = {
  title: 'Bestehende Adressdaten',
  fields: [
    {
      name: 'building_name',
      label: 'Gebäudename',
      type: 'text',
      required: false,
      editable: false
    },
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
      defaultValue: 'Deutschland',
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
