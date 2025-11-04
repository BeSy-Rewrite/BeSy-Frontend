import { FormConfig } from '../../components/form-component/form-component.component';
import { Validators } from '@angular/forms';


export const ORDER_ADDRESS_FORM_CONFIG: FormConfig = {
  subtitle: 'Lieferadresse für die Bestellung',
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
      type: 'textarea',
      required: false,
      editable: false,
      validators: [Validators.maxLength(255)]
    }
  ]
};

export const ORDER_MAIN_OFFER_FORM_CONFIG: FormConfig = {
  title: 'Hauptangebot festlegen',
  fields: [
    {
      name: 'quote_number',
      label: 'Angebotsnummer',
      type: 'text',
      required: false,
      editable: true,
      validators: [Validators.maxLength(100)],
      tooltip: 'Die Angebotsnummer ist eine vom Lieferanten vergebene Nummer, die das Angebot eindeutig identifiziert.'
    },
    {
      name: 'supplier_id',
      label: 'Lieferant',
      type: 'autocomplete',
      requireSelection: true,
      required: false,
      filterable: true,
      // Will be loaded from suppliers api
      options: [],
      editable: true,
      emitAsSignal: true,
      tooltip: 'Der Lieferant ist das Unternehmen, bei dem die Bestellung aufgegeben wird.'
    },
    {
      name: 'customer_id',
      label: 'Kundennummer',
      type: 'select',
      required: false,
      // Will be loaded from API: customersId
      options: [{ label: 'Bitte wählen sie zuerst einen Lieferanten aus.', value: undefined }],
      editable: true,
      tooltip: 'Die Kundennummer wird vom Lieferanten vergeben und dient der eindeutigen Identifikation bei diesem Lieferanten.'
    },
    {
      name: 'quote_price',
      label: 'Preis des Hauptangebots (netto)',
      type: 'text',
      required: false,
      editable: true,
      //validators: [Validators.pattern('^\\d+,\\d{2}$')]
      tooltip: 'Der Preis des Hauptangebots ist der Gesamtpreis (netto) des Angebots, welches für die Bestellung zugrunde gelegt wird.'
    },
    {
      name: 'currency_short',
      label: 'Währung',
      type: 'autocomplete',
      requireSelection: true,
      required: false,
      filterable: true,
      // Will be loaded from currencies api
      options: [],
      editable: true,
      tooltip: 'Die Währung, in welcher der Preis des Hauptangebots angegeben ist.',
      defaultValue: [],
      emitAsSignal: true
    },
    {
      name: 'quote_date',
      label: 'Datum des Hauptangebots',
      type: 'date',
      required: false,
      editable: true
    },
    {
      name: 'comment_for_supplier',
      label: 'Kommentar',
      type: 'textarea',
      required: false,
      editable: true,
      validators: [Validators.maxLength(255)]
    }
  ]
};

export const ORDER_SUPPLIER_DECISION_REASON_FORM_CONFIG: FormConfig = {
  title: 'Lieferantenauswahl begründen',
  fields: [
    {
      name: 'flag_decision_cheapest_offer',
      label: 'Günstigstes Angebot',
      type: 'checkbox',
      required: false,
      defaultValue: false
    },
    {
      name: 'flag_decision_most_economical_offer',
      label: 'Wirtschaftlichstes Angebot',
      type: 'checkbox',
      required: false,
      defaultValue: false
    },
    {
      name: 'flag_decision_sole_supplier',
      label: 'Einziger Lieferant',
      type: 'checkbox',
      required: false,
      defaultValue: false
    },
    {
      name: 'flag_decision_contract_partner',
      label: 'Vertragspartner',
      type: 'checkbox',
      required: false,
      defaultValue: false
    },
    {
      name: 'flag_decision_preferred_supplier_list',
      label: 'Lieferant aus der Vorzugsliste',
      type: 'checkbox',
      required: false,
      defaultValue: false
    },
    {
      name: 'flag_decision_other_reasons',
      label: 'Sonstiger Grund',
      type: 'checkbox',
      required: false,
      defaultValue: false,
      emitAsSignal: true
    }
  ]
};

export const ORDER_QUOTATION_FORM_CONFIG: FormConfig = {
  title: 'Vergleichsangebot hinzufügen',
  fields: [
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
    },
    {
      name: 'quote_date',
      label: 'Datum des Vergleichsangebots',
      type: 'date',
      required: true,
      editable: true
    }
  ]
};

export const ORDER_APPROVAL_FORM_CONFIG: FormConfig = {
  title: 'Zustimmung(en) hinzufügen',
  fields: [
    {
      name: 'flag_edv_permission',
      label: 'Beschaffung von Soft-/Hardware mit Rechenzentrum abgeklärt',
      type: 'checkbox',
      required: false,
      defaultValue: false,
      tooltip: 'Für Hardware und Software, die in der Vorzugsliste des Rechenzentrums - RZ nicht enthalten ist, ist die Beschaffung mit dem RZ geklärt und liegt dieser Bestellung bei'
    },
    {
      name: 'flag_furniture_permission',
      label: 'Beschaffung von Möbeln mit Gebäudemanagement abgeklärt',
      type: 'checkbox',
      required: false,
      defaultValue: false,
      tooltip: 'Für Möbel, die in der Vorzugsliste des Facility Managements nicht enthalten sind, ist die Beschaffung mit dem Facility Management geklärt und liegt dieser Bestellung bei'
    },
    {
      name: 'flag_furniture_room',
      label: 'Erforderlicher Raum für die Möbel steht zur Verfügung',
      type: 'checkbox',
      required: false,
      defaultValue: false,
      tooltip: 'Der erforderliche Raum für die Aufnahme der Möbel steht zur Verfügung'
    },
    {
      name: 'flag_investment_room',
      label: 'Erforderlicher Raum für die Geräte steht zur Verfügung',
      type: 'checkbox',
      required: false,
      defaultValue: false,
      tooltip: 'Der erforderliche Raum für die Aufnahme der Geräte steht zur Verfügung'
    },
    {
      name: 'flag_investment_structural_measures',
      label: 'Erforderliche bauliche Maßnahmen sind beauftragt',
      type: 'checkbox',
      required: false,
      defaultValue: false,
      tooltip: 'Für Gegenstände, die in der Vorzugsliste des Facility Managements nicht enthalten sind, ist die Beschaffung mit dem FM geklärt und liegt dieser Bestellung bei.'
    },
    {
      name: 'flag_media_permission',
      label: 'Beschaffung mit Medientechnik abgesprochen',
      type: 'checkbox',
      required: false,
      defaultValue: false,
      tooltip: 'Für die Beschaffung ist die Zustimmung der Medientechnik erforderlich. Die Zustimmung der Medientechnik liegt dieser Bestellung bei.'
    }
  ]
};

export const ORDER_PRIMARY_COST_CENTER_FORM_CONFIG: FormConfig = {
  fields: [
    {
      name: 'primary_cost_center_id',
      label: 'Primäre Kostenstelle',
      type: 'autocomplete',
      required: true,
      requireSelection: true,
      editable: false,
      filterable: true,
      tooltip: 'Pflichtfeld',
      defaultValue: []
    }
  ]
};

export const ORDER_SECONDARY_COST_CENTER_FORM_CONFIG: FormConfig = {
  fields: [
    {
      name: 'secondary_cost_center_id',
      label: 'Sekundäre Kostenstelle',
      type: 'autocomplete',
      required: false,
      requireSelection: true,
      editable: true,
      filterable: true,
      tooltip: 'Pflichtfeld',
      defaultValue: []
    }
  ]
};

export const ORDER_GENERAL_FORM_CONFIG: FormConfig = {
  title: 'Allgemeine Angaben',
  fields: [
    {
      name: 'content_description',
      label: 'Bestellungsname',
      type: 'text',
      required: true,
      editable: false,
      validators: [Validators.maxLength(100)],
      tooltip: 'Name der Bestellung, unter diesem Namen wird die Bestellung in der Übersicht angezeigt.',
    },
    {
      name: 'booking_year',
      label: 'Buchungsjahr',
      type: 'text',
      required: true,
      editable: false,
      validators: [Validators.pattern('^[0-9]{4}$')],
      tooltip: 'Das Buchungsjahr gibt an, in welchem Jahr die Bestellung verbucht wird.',
      defaultValue: new Date().getFullYear().toString()
    }
  ]
};

export const ORDER_QUERIES_PERSON_FORM_CONFIG: FormConfig = {
  fields: [
    {
      name: 'queries_person_id',
      label: 'Person für Rückfragen',
      type: 'autocomplete',
      requireSelection: true,
      required: false,
      filterable: true,
      // Will be loaded from persons api
      options: [],
      editable: true,
      tooltip: 'Die Person, die bei Rückfragen zur Bestellung kontaktiert werden kann.',
      emitAsSignal: true,
      defaultValue: []
    }
  ]
};

export const ORDER_DELIVERY_PERSON_FORM_CONFIG: FormConfig = {
  title: 'Adressdaten',
  fields: [
    {
      name: 'delivery_person_id',
      label: 'Lieferperson',
      type: 'autocomplete',
      requireSelection: true,
      required: false,
      filterable: true,
      // Will be loaded from persons api
      options: [],
      editable: true,
      tooltip: 'Die Person, die für die Lieferung verantwortlich ist.',
      emitAsSignal: true,
      defaultValue: []
    }
  ]
};

export const ORDER_INVOICE_PERSON_FORM_CONFIG: FormConfig = {
  title: 'Rechnungsempfänger festlegen',
  fields: [
    {
      name: 'invoice_person_id',
      label: 'Rechnungsempfänger',
      type: 'autocomplete',
      requireSelection: true,
      required: false,
      filterable: true,
      // Will be loaded from persons api
      options: [],
      editable: true,
      tooltip: 'Die Person, die für die Rechnungsstellung verantwortlich ist.',
      emitAsSignal: true,
      defaultValue: []
    }
  ]
};
