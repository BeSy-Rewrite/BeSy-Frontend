import { Validators } from "@angular/forms";
import { AddressConfig } from "../../components/address-form/address-form.component";

export const EDIT_SUPPLIER_ADDRESS_FORM_CONFIG: AddressConfig = {
  title: 'Bestehende Adressdaten',
  fields: [
    {
      name: 'building_name',
      label: 'Gebäudename',
      type: 'text',
      required: false,
      editable: true
    },
    {
      name: 'street',
      label: 'Straßenname',
      type: 'text',
      required: true,
      nominatim_param: 'street',
      nominatim_field: 'road',
      editable: true
    },
    {
      name: 'building_number',
      label: 'Hausnummer',
      type: 'text',
      required: false,
      nominatim_param: 'street',
      nominatim_field: 'house_number',
      editable: true
    },
    {
      name: 'town',
      label: 'Stadt',
      type: 'text',
      required: true,
      nominatim_param: 'city',
      nominatim_field: 'town',
      editable: true
    },
    {
      name: 'postal_code',
      label: 'PLZ',
      type: 'text',
      required: true,
      nominatim_param: 'postalcode',
      nominatim_field: 'postcode',
      editable: true
    },
    {
      name: 'county',
      label: 'Region',
      type: 'text',
      required: false,
      nominatim_param: 'county',
      nominatim_field: 'county',
      editable: true
    },
    {
      name: 'country',
      label: 'Land',
      type: 'text',
      required: true,
      defaultValue: 'Deutschland',
      nominatim_param: 'country',
      nominatim_field: 'country',
      editable: true
    },
    {
      name: 'comment',
      label: 'Kommentar',
      type: 'textarea',
      required: false,
      editable: true,
      validators: [Validators.maxLength(255)]
    }
  ]
};
