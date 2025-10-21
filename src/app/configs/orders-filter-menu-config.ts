import { FilterType } from "../models/filter/filter-menu-types";

/**
 * Interface representing the configuration for a filter in the orders filter menu.
 */
interface FilterConfig {
    /** Key corresponding to the filter field in the data model. */
    key: string;
    /** Display title for the filter in the UI. */
    title: string;
    /** Type of filter (select, date range, range, etc.). */
    type: FilterType;
    /** Optional data for configuring filter specifics (labels, placeholders, min/max values or dates). */
    data?: {
        /** Minimum selectable date for date range filters. */
        minDate?: Date;
        /** Maximum selectable date for date range filters. */
        maxDate?: Date;
        /** Label for input fields in the filter UI. */
        inputLabel?: string;
        /** Placeholder text for input fields in the filter UI. */
        inputPlaceholder?: string;
        /** Minimum value for range filters. */
        minValue?: number;
        /** Maximum value for range filters. */
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
        title: 'Bestellt für',
        type: FilterType.SELECT,
        data: {
            inputLabel: 'Person auswählen',
            inputPlaceholder: 'Suchbegriff eingeben'
        }
    },
    {
        key: 'invoice_person_id',
        title: 'Rechnungsempfänger:in',
        type: FilterType.SELECT,
        data: {
            inputLabel: 'Person auswählen',
            inputPlaceholder: 'Suchbegriff eingeben'
        }
    },
    {
        key: 'queries_person_id',
        title: 'Ansprechperson',
        type: FilterType.SELECT,
        data: {
            inputLabel: 'Person auswählen',
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
