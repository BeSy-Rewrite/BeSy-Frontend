import { FilterType } from "../models/filter-menu-types";

interface FilterConfig {
    key: string;
    title: string;
    type: FilterType;
    data?: {
        minDate?: Date;
        maxDate?: Date;
        inputLabel?: string;
        inputPlaceholder?: string;
        minValue?: number;
        maxValue?: number;
    };
}

export const ORDERS_FILTER_MENU_CONFIG: FilterConfig[] = [
    {
        key: 'primary_cost_center_id',
        title: 'Primäre Kostenstelle',
        type: FilterType.SELECT,
        data: {
            inputLabel: 'Kostenstelle auswählen',
            inputPlaceholder: 'Suchbegriff eingeben'
        }
    },
    {
        key: 'booking_year',
        title: 'Buchungsjahr',
        type: FilterType.SELECT,
        data: {
            inputLabel: 'Buchungsjahr auswählen',
            inputPlaceholder: 'Suchbegriff eingeben'
        }
    },
    {
        key: 'created_date',
        title: 'Erstelldatum',
        type: FilterType.DATE_RANGE,
        data: {
            minDate: new Date(2000, 0, 1),
            maxDate: new Date()
        }
    },
    {
        key: 'owner_id',
        title: 'Erstellt von',
        type: FilterType.SELECT,
        data: {
            inputLabel: 'Person auswählen',
            inputPlaceholder: 'Suchbegriff eingeben'
        }
    },
    {
        key: 'status',
        title: 'Status',
        type: FilterType.SELECT,
        data: {
            inputLabel: 'Status auswählen',
            inputPlaceholder: 'Suchbegriff eingeben'
        }
    },
    {
        key: 'quote_price',
        title: 'Angebotspreis',
        type: FilterType.RANGE,
        data: {
            minValue: 0,
            maxValue: 10000
        }
    },
    {
        key: 'delivery_person_id',
        title: 'Bestellt von',
        type: FilterType.SELECT,
        data: {
            inputLabel: 'Person auswählen',
            inputPlaceholder: 'Suchbegriff eingeben'
        }
    },
    {
        key: 'invoice_person_id',
        title: 'invoicePerson',
        type: FilterType.SELECT,
        data: {
            inputLabel: 'Person auswählen',
            inputPlaceholder: 'Suchbegriff eingeben'
        }
    },
    {
        key: 'queries_person_id',
        title: 'queriesPerson',
        type: FilterType.SELECT,
        data: {
            inputLabel: 'Person auswählen',
            inputPlaceholder: 'Suchbegriff eingeben'
        }
    },
    {
        key: 'customer_id',
        title: 'Kundennummer',
        type: FilterType.SELECT,
        data: {
            inputLabel: 'Kundennummer auswählen',
            inputPlaceholder: 'Suchbegriff eingeben'
        }
    },
    {
        key: 'supplier_id',
        title: 'Lieferant',
        type: FilterType.SELECT,
        data: {
            inputLabel: 'Lieferant auswählen',
            inputPlaceholder: 'Suchbegriff eingeben'
        }
    },
    {
        key: 'secondary_cost_center_id',
        title: 'Sekundäre Kostenstelle',
        type: FilterType.SELECT,
        data: {
            inputLabel: 'Kostenstelle auswählen',
            inputPlaceholder: 'Suchbegriff eingeben'
        }
    },
    {
        key: 'last_updated_time',
        title: 'Änderungsdatum',
        type: FilterType.DATE_RANGE,
        data: {
            minDate: new Date(2000, 0, 1),
            maxDate: new Date()
        }
    }
];
