import { OrderStatus } from "../api";

export interface FilterRequestParams {
    primaryCostCenters: Array<string> | undefined,
    bookingYears: Array<string> | undefined,
    createdAfter: string | undefined,
    createdBefore: string | undefined,
    ownerIds: Array<number> | undefined,
    statuses: Array<OrderStatus> | undefined,
    quotePriceMin: number | undefined,
    quotePriceMax: number | undefined,
    deliveryPersonIds: Array<number> | undefined,
    invoicePersonIds: Array<number> | undefined,
    queriesPersonIds: Array<number> | undefined,
    customerIds: Array<string> | undefined,
    supplierIds: Array<number> | undefined,
    secondaryCostCenters: Array<string> | undefined,
    lastUpdatedTimeAfter: string | undefined,
    lastUpdatedTimeBefore: string | undefined,
}
