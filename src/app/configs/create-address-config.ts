import { Validators } from "@angular/forms";
import { AddressConfig } from "../components/address-form/address-form.component";

export const ADDRESS_FORM_CONFIG: AddressConfig = {
  title: '2. Präferierte Adresse festlegen',
  editSubtitle: 'Bestehende Adresse auswählen',
  newAddressSubtitle: 'Neue Adresse anlegen',
  fields: [
    {
      // to be decided how this field will be handled
      //
      name: 'addressMode',
      label: 'Adressmodus',
      type: 'radio',
      required: true,
      options: [
        { label: 'Existierende Addresse wählen', value: 'existing' },
        { label: 'Neue Adresse anlegen', value: 'new' }
      ],
      defaultValue: 'existing',
      emitAsSignal: true,
      editable: false
    },
    {
      label: 'Existierende Adressen',
      type: 'table',
      name: 'existingAddresses',
      required: false,
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
      nominatim_param: 'country',
      nominatim_field: 'country',
      editable: false
    },
    {
      name: 'comment',
      label: 'Kommentar',
      type: 'textarea',
      required: false,
      editable: false,
      validators: [Validators.maxLength(255)]
    }
  ]
};
