import { OrderStatus } from "../../api-services-v2";
import { OrdersFilterPreset } from "../../models/filter/filter-presets";


const currentYearString = new Date().getFullYear().toString();

export const LAST_ACTIVE_FILTERS_KEY = 'lastActiveFilters';
export const CURRENT_USER_PLACEHOLDER = 'CURRENT_USER';

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
                    CURRENT_USER_PLACEHOLDER
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
