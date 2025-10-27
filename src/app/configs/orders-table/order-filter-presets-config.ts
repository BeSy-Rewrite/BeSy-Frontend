import { OrderStatus } from "../../api";
import { OrdersFilterPreset } from "../../models/filter/filter-presets";


const currentYearString = new Date().getFullYear().toString();

export const ORDERS_FILTER_PRESETS: OrdersFilterPreset[] = [
    {
        label: currentYearString,
        appliedFilters: [
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
        appliedFilters: [
            {
                id: "owner_id",
                chipIds: [
                    "CURRENT_USER"
                ]
            }
        ]
    },
    {
        label: 'Auf\u00A0Freigabe\u00A0wartend',
        appliedFilters: [
            {
                id: "status",
                chipIds: [
                    OrderStatus.APPROVALS_RECEIVED
                ]
            }
        ]
    }
];
