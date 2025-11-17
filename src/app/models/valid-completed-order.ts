import * as zod from 'zod';
import { OrderStatus } from "../api-services-v2";


/**
 * Zod schema to validate a completed order with essential properties.
 */
export const ValidCompletedOrder = zod.object({
    id: zod.number(),
    primary_cost_center_id: zod.string(),
    booking_year: zod.string(),
    created_date: zod.string(),
    owner_id: zod.number(),
    content_description: zod.string(),
    status: zod.nativeEnum(OrderStatus),
    currency: zod.object({
        code: zod.string(),
        name: zod.string()
    }),
    delivery_person_id: zod.number(),
    queries_person_id: zod.number(),
    customer_id: zod.string(),
    supplier_id: zod.number(),
    secondary_cost_center_id: zod.string(),
    delivery_address_id: zod.number(),
    invoice_address_id: zod.number()
});

/**
 * Type representing a valid completed order with essential properties.
 */
export type ValidCompletedOrder = zod.infer<typeof ValidCompletedOrder>;
