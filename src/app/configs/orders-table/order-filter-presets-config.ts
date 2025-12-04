import { OrderStatus } from "../../api-services-v2";
import { OrdersFilterPreset } from "../../models/filter/filter-presets";


const currentYearString = new Date().getFullYear().toString();
const NBSP = '\u00A0';

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
        label: `Meine${NBSP}Bestellungen`,
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
        label: `Auf${NBSP}Dekanatsfreigabe${NBSP}wartend`,
        appliedFilters: [
            {
                id: "status",
                chipIds: [
                    OrderStatus.APPROVALS_RECEIVED
                ]
            }
        ]
    },
    {
        label: `In${NBSP}Bearbeitung`,
        appliedFilters: [
            {
                id: "status",
                chipIds: [
                    OrderStatus.IN_PROGRESS
                ]
            }
        ]
    }
];
