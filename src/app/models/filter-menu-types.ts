import { FilterChipData } from "../models/filter-chip-data";
import { FilterDateRange } from "../models/filter-date-range";
import { FilterRange } from "../models/filter-range";

/**
 * Enum representing the available filter types.
 */
export enum FilterType {
    /** Filter for date ranges. */
    DATE_RANGE = 'date-range',
    /** Filter for selectable options (chips). */
    SELECT = 'select',
    /** Filter for numeric or value ranges. */
    RANGE = 'range',
}

/**
 * Interface representing the structure of all active filters in the application.
 */
export interface ActiveFilters {
    primary_cost_center_id: FilterChipData[];
    secondary_cost_center_id: FilterChipData[];
    owner_id: FilterChipData[];
    status: FilterChipData[];
    delivery_person_id: FilterChipData[];
    invoice_person_id: FilterChipData[];
    queries_person_id: FilterChipData[];
    supplier_id: FilterChipData[];
    created_date: FilterDateRange;
    last_updated_time: FilterDateRange;
    quote_price: FilterRange;
    booking_year: FilterChipData[];
}
