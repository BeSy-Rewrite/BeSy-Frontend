import { FormPageConfig, FormFieldConfig } from '../components/generic-form-page/generic-form-page.component';
import { Validators } from '@angular/forms';

// Cost Center Configuration
export const COST_CENTER_FORM_CONFIG: FormPageConfig = {
  title: 'Neue Kostenstelle hinzufügen',
  apiEndpoint: 'cost_centers',
  successMessage: 'Kostenstelle erfolgreich gespeichert ',
  fields: [
    {
      name: 'cost_center_id',
      label: 'Kostenstellenummer',
      type: 'text',
      required: true
    },
    {
      name: 'cost_center_name',
      label: 'Kostenstellename',
      type: 'text',
      required: true
    },
    {
      name: 'cost_center_begin_date',
      label: 'Gültig ab',
      type: 'date',
      required: false
    },
    {
      name: 'cost_center_end_date',
      label: 'Gültig bis',
      type: 'date',
      required: false
    },
    {
      name: 'cost_center_comment',
      label: 'Kommentar',
      type: 'text',
      required: false
    }
  ]
};

// Person Configuration (matches PersonRequestDTO)
export const PERSON_FORM_CONFIG: FormPageConfig = {
  title: 'Person hinzufügen',
  apiEndpoint: 'persons',
  successMessage: 'Person erfolgreich gespeichert',
  fields: [
    {
      name: 'gender',
      label: 'Geschlecht',
      type: 'select',
      required: false,
      options: [
        { value: 'm', label: 'Männlich' },
        { value: 'f', label: 'Weiblich' }
      ],
      optionValue: 'value',
      optionLabel: 'label'
    },
    {
      name: 'name',
      label: 'Vorname',
      type: 'text',
      required: false
    },
    {
      name: 'surname',
      label: 'Nachname',
      type: 'text',
      required: false
    },
    {
      name: 'title',
      label: 'Titel',
      type: 'text',
      required: false
    },
    {
      name: 'email',
      label: 'E-Mail',
      type: 'email',
      required: false,
      validators: [Validators.email]
    },
    {
      name: 'phone',
      label: 'Telefon',
      type: 'tel',
      required: false
    },
    {
      name: 'fax',
      label: 'Fax',
      type: 'tel',
      required: false
    },
    {
      name: 'address_id',
      label: 'Adress-ID',
      type: 'number',
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

// Customer Configuration
export const CUSTOMER_FORM_CONFIG: FormPageConfig = {
  title: 'Neue Kundennummer hinzufügen',
  apiEndpoint: 'customer_id',
  successMessage: 'Kundennummer erfolgreich gespeichert',
  fields: [
    {
      name: 'customer_id',
      label: 'Kundennummer',
      type: 'text',
      required: true
    },
    {
      name: 'supplier_name',
      label: 'Lieferanten',
      type: 'select',
      required: true,
      // Will be loaded from API: suppliers
      optionValue: 'supplier_name',
      optionLabel: 'supplier_name'
    },
    {
      name: 'customer_id_comment',
      label: 'Kommentar',
      type: 'text',
      required: false
    }
  ]
};

// Item Configuration
export const ITEM_FORM_CONFIG: FormPageConfig = {
  title: 'Neue Bestellposition hinzufügen',
  apiEndpoint: 'items',
  successMessage: 'Bestellposition erfolgreich gespeichert',
  fields: [
    {
      name: 'item_quantity',
      label: 'Menge',
      type: 'number',
      required: false
    },
    {
      name: 'item_article_id',
      label: 'Artikelnummer',
      type: 'text',
      required: false
    },
    {
      name: 'item_name',
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
      optionValue: 'vat_value',
      optionLabel: 'vat_value'
    },
    {
      name: 'item_vat_type',
      label: 'Eingabeformat',
      type: 'select',
      required: true,
      options: [
        { value: 'netto', label: 'netto' },
        { value: 'brutto', label: 'brutto' }
      ],
      optionValue: 'value',
      optionLabel: 'label'
    },
    {
      name: 'item_price_per_unit',
      label: 'Preis pro Einheit',
      type: 'number',
      required: true
    },
    {
      name: 'item_quantity_unit',
      label: 'Mengeneinheit',
      type: 'text',
      required: false
    },
    {
      name: 'preferred_list_abbr',
      label: 'Vorzugsliste',
      type: 'select',
      required: false,
      // Will be loaded from API: preferred_lists
      optionValue: 'preferred_list_abbr',
      optionLabel: 'preferred_list_abbr'
    },
    {
      name: 'item_preferred_list_number',
      label: 'Vorzugslistennummer',
      type: 'text',
      required: false
    },
    {
      name: 'item_comment',
      label: 'Kommentar',
      type: 'text',
      required: false
    }
  ]
};

// Quotation Configuration
export const QUOTATION_FORM_CONFIG: FormPageConfig = {
  title: 'Neues Vergleichsangebot hinzufügen',
  apiEndpoint: 'quotations',
  successMessage: 'Vergleichsangebot erfolgreich gespeichert',
  fields: [
    {
      name: 'quotation_company_name',
      label: 'Unternehmen',
      type: 'text',
      required: true
    },
    {
      name: 'quotation_price',
      label: 'Preis',
      type: 'number',
      required: true
    },
    {
      name: 'quotation_quote_date',
      label: 'Datum',
      type: 'date',
      required: true
    },
    {
      name: 'quotation_company_city',
      label: 'Stadt',
      type: 'text',
      required: false
    }
  ]
};

// Address Configuration (matches AddressRequestDTO)
export const ADDRESS_FORM_CONFIG: FormPageConfig = {
  title: 'Adresse hinzufügen',
  apiEndpoint: 'addresses',
  successMessage: 'Adresse erfolgreich gespeichert',
  fields: [
    {
      name: 'name',
      label: 'Adressbezeichnung',
      type: 'text',
      required: true
    },
    {
      name: 'building_name',
      label: 'Gebäudename',
      type: 'text',
      required: false
    },
    {
      name: 'street',
      label: 'Straßenname',
      type: 'text',
      required: true
    },
    {
      name: 'building_number',
      label: 'Hausnummer',
      type: 'text',
      required: false
    },
    {
      name: 'town',
      label: 'Stadt',
      type: 'text',
      required: true
    },
    {
      name: 'postal_code',
      label: 'PLZ',
      type: 'text',
      required: true
    },
    {
      name: 'county',
      label: 'Region',
      type: 'text',
      required: false
    },
    {
      name: 'country',
      label: 'Land',
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

// Dynamic Address Form Configuration Function
// This function allows creating a dynamic form configuration for adding or editing addresses
// It accepts a boolean parameter to determine if the form is for editing an existing address
export function createAddressFormConfig(isEdit: boolean = false): FormPageConfig {
  return {
    title: isEdit ? 'Adresse bearbeiten' : 'Adresse hinzufügen',
    apiEndpoint: 'addresses',
    successMessage: isEdit ? 'Adresse erfolgreich aktualisiert' : 'Adresse erfolgreich gespeichert',
    fields: ADDRESS_FORM_CONFIG.fields
  };
}

// Supplier Configuration (matches SupplierRequestDTO)
export const SUPPLIER_FORM_CONFIG: FormPageConfig = {
  title: 'Neuen Lieferanten hinzufügen',
  apiEndpoint: 'suppliers',
  successMessage: 'Lieferant erfolgreich gespeichert',
  fields: [
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      required: true
    },
    {
      name: 'phone',
      label: 'Telefon',
      type: 'tel',
      required: false
    },
    {
      name: 'fax',
      label: 'Fax',
      type: 'tel',
      required: false
    },
    {
      name: 'email',
      label: 'E-Mail',
      type: 'email',
      required: false,
      validators: [Validators.email]
    },
    {
      name: 'website',
      label: 'Website',
      type: 'text',
      required: false
    },
    {
      name: 'vat_id',
      label: 'VAT ID',
      type: 'text',
      required: false
    },
    {
      name: 'flag_preferred',
      label: 'Vorzugslieferant',
      type: 'select',
      required: true,
      options: [
        { value: false, label: 'Nein' },
        { value: true, label: 'Ja' }
      ],
      optionValue: 'value',
      optionLabel: 'label'
    },
    {
      name: 'address_id',
      label: 'Adress-ID (optional)',
      type: 'number',
      required: false
    },
    // Address fields embedded in supplier
    {
      name: 'building_name',
      label: 'Gebäudename',
      type: 'text',
      required: false
    },
    {
      name: 'street',
      label: 'Straßenname',
      type: 'text',
      required: true
    },
    {
      name: 'building_number',
      label: 'Hausnummer',
      type: 'text',
      required: false
    },
    {
      name: 'postal_code',
      label: 'PLZ',
      type: 'text',
      required: true
    },
    {
      name: 'town',
      label: 'Stadt',
      type: 'text',
      required: true
    },
    {
      name: 'county',
      label: 'Region',
      type: 'text',
      required: false
    },
    {
      name: 'country',
      label: 'Land',
      type: 'text',
      required: true
    },
    {
      name: 'comment',
      label: 'Kommentar',
      type: 'text',
      required: false
    }
  ]
};
