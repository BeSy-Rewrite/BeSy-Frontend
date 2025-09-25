import { FormConfig } from '../../components/form-component/form-component.component';
import { Validators } from '@angular/forms';


export const ORDER_ADDRESS_FORM_CONFIG: FormConfig = {
  title: 'Adresse festlegen',
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
      editable: false,
      validators: [Validators.pattern('^[0-9]+$')] // Only allow numbers
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
      editable: false,
      validators: [Validators.pattern('^[0-9]+$')] // Only allow numbers
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
};

export const ORDER_APPROVAL_FORM_CONFIG: FormConfig = {
  title: 'Zustimmung(en) hinzufügen',
  fields: [
    {
      name: 'flagEdvPermission',
      label: 'Beschaffung von Soft-/Hardware mit Rechenzentrum abgeklärt',
      type: 'checkbox',
      required: false,
      defaultValue: false,
      tooltip: 'Für Hardware und Software, die in der Vorzugsliste des Rechenzentrums - RZ nicht enthalten ist, ist die Beschaffung mit dem RZ geklärt und liegt dieser Bestellung bei'
    },
    {
      name: 'flagFurniturePermission',
      label: 'Beschaffung von Möbeln mit Gebäudemanagement abgeklärt',
      type: 'checkbox',
      required: false,
      defaultValue: false,
      tooltip: 'Für Möbel, die in der Vorzugsliste des Facility Managements nicht enthalten sind, ist die Beschaffung mit dem Facility Management geklärt und liegt dieser Bestellung bei'
    },
    {
      name: 'flagFurnitureRoom',
      label: 'Erforderlicher Raum für die Möbel steht zur Verfügung',
      type: 'checkbox',
      required: false,
      defaultValue: false,
      tooltip: 'Der erforderliche Raum für die Aufnahme der Möbel steht zur Verfügung'
    },
    {
      name: 'flagInvestmentRoom',
      label: 'Erforderlicher Raum für die Geräte steht zur Verfügung',
      type: 'checkbox',
      required: false,
      defaultValue: false,
      tooltip: 'Der erforderliche Raum für die Aufnahme der Geräte steht zur Verfügung'
    },
    {
      name: 'flagInvestmentStructuralMeasures',
      label: 'Erforderliche bauliche Maßnahmen sind beauftragt',
      type: 'checkbox',
      required: false,
      defaultValue: false,
      tooltip: 'Für Gegenstände, die in der Vorzugsliste des Facility Managements nicht enthalten sind, ist die Beschaffung mit dem FM geklärt und liegt dieser Bestellung bei.'
    },
    {
      name: 'flagMediaPermission',
      label: 'Beschaffung mit Medientechnik abgesprochen',
      type: 'checkbox',
      required: false,
      defaultValue: false,
      tooltip: 'Für die Beschaffung ist die Zustimmung der Medientechnik erforderlich. Die Zustimmung der Medientechnik liegt dieser Bestellung bei.'
    }
  ]
};
