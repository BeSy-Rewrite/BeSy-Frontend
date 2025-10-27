import { FilterDateRange } from "./filter-date-range";
import { ActiveFilters } from "./filter-menu-types";
import { FilterRange } from "./filter-range";

/**
 * Type representing a basic filter preset.
 */
export type FilterPreset = {
    /** The key of the active filter associated with this preset. */
    id: keyof ActiveFilters;
};

/**
 * Type representing a chip filter preset, which includes chip IDs.
 */
export type ChipFilterPreset = FilterPreset & {
    /** An array of chip IDs associated with this filter preset. */
    chipIds: (string | number)[];
};

/**
 * Type representing a date range filter preset.
 */
export type DateRangeFilterPreset = FilterPreset & {
    /** The date range associated with this filter preset. */
    dateRange: FilterDateRange;
};

/**
 * Type representing a range filter preset.
 */
export type RangeFilterPreset = FilterPreset & {
    /** The range associated with this filter preset. */
    range: FilterRange;
};

/**
 * Type representing an orders filter preset, which includes a label and an array of filter presets.
 */
export type OrdersFilterPreset = {
    /** The label for the orders filter preset. */
    label: string;
    /** An array of filter presets (chip, date range, or range) associated with this orders filter preset. */
    appliedFilters: (ChipFilterPreset | DateRangeFilterPreset | RangeFilterPreset)[];
};

/**
 * Type representing URL parameters for filter presets.
 * Each key corresponds to a filter in ActiveFilters, and the value is a string or undefined.
 */
export type FilterPresetParams = { [key in keyof ActiveFilters]: string | undefined };
