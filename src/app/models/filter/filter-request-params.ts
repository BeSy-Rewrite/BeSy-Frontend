import { OrderStatus } from "../../api-services-v2";

/**
 * Interface representing the parameters for a filter request.
 * Used to query orders based on various filter criteria.
 */
export interface FilterRequestParams {
    /** Array of primary cost center IDs to filter by. */
    primaryCostCenters: Array<string> | undefined;
    /** Array of booking years to filter by. */
    bookingYears: Array<string> | undefined;
    /** ISO date string representing the earliest creation date to filter by. */
    createdAfter: string | undefined;
    /** ISO date string representing the latest creation date to filter by. */
    createdBefore: string | undefined;
    /** Array of owner IDs to filter by. */
    ownerIds: Array<number> | undefined;
    /** Array of order statuses to filter by. */
    statuses: Array<OrderStatus> | undefined;
    /** Minimum quote price to filter by. */
    quotePriceMin: number | undefined;
    /** Maximum quote price to filter by. */
    quotePriceMax: number | undefined;
    /** Array of delivery person IDs to filter by. */
    deliveryPersonIds: Array<number> | undefined;
    /** Array of invoice person IDs to filter by. */
    invoicePersonIds: Array<number> | undefined;
    /** Array of queries person IDs to filter by. */
    queriesPersonIds: Array<number> | undefined;
    /** Array of customer IDs to filter by. */
    customerIds: Array<string> | undefined;
    /** Array of supplier IDs to filter by. */
    supplierIds: Array<number> | undefined;
    /** Array of secondary cost center IDs to filter by. */
    secondaryCostCenters: Array<string> | undefined;
    /** ISO date string representing the earliest last updated time to filter by. */
    lastUpdatedTimeAfter: string | undefined;
    /** ISO date string representing the latest last updated time to filter by. */
    lastUpdatedTimeBefore: string | undefined;
}
