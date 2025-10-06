import { FilterDateRange } from "./filter-date-range";
import { FilterRange } from "./filter-range";

export type FilterPreset = {
    id: string;
};
export type ChipFilterPreset = FilterPreset & {
    chipIds: (string | number)[];
};
export type DateRangeFilterPreset = FilterPreset & {
    dateRange: FilterDateRange;
};
export type RangeFilterPreset = FilterPreset & {
    range: FilterRange;
};

export type OrdersFilterPreset = {
    label: string;
    presets: (ChipFilterPreset | DateRangeFilterPreset | RangeFilterPreset)[];
}