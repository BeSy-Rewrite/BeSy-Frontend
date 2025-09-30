import { OrderStatus } from "../api";
import { FilterDateRange } from "../models/filter-date-range";
import { FilterRange } from "../models/filter-range";

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

const currentYearString = new Date().getFullYear().toString();

export const ORDERS_FILTER_PRESETS: OrdersFilterPreset[] = [
    {
        label: currentYearString,
        presets: [
            {
                id: "booking_year",
                chipIds: [
                    currentYearString.slice(-2)
                ]
            }
        ]
    },
    {
        label: 'Meine\u00A0Bestellungen',
        presets: [
            {
                id: "owner_id",
                chipIds: [
                    1 // Replace with dynamic user ID as needed
                ]
            }
        ]
    },
    {
        label: 'Auf\u00A0Freigabe\u00A0wartend',
        presets: [
            {
                id: "status",
                chipIds: [
                    OrderStatus.APPROVALS_RECEIVED
                ]
            }
        ]
    }
]
