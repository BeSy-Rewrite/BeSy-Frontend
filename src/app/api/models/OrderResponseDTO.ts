/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CurrencyResponseDTO } from './CurrencyResponseDTO';
import { OrderStatus } from './OrderStatus';
export type OrderResponseDTO = {
    id?: number;
    primary_cost_center_id?: string;
    booking_year?: string;
    auto_index?: number;
    created_date?: string;
    legacy_alias?: string;
    owner_id?: number;
    content_description?: string;
    status?: OrderStatus;
    currency?: CurrencyResponseDTO;
    comment?: string;
    comment_for_supplier?: string;
    quote_number?: string;
    quote_sign?: string;
    quote_date?: string;
    quote_price?: number;
    delivery_person_id?: number;
    invoice_person_id?: number;
    queries_person_id?: number;
    customer_id?: string;
    supplier_id?: number;
    secondary_cost_center_id?: string;
    fixed_discount?: number;
    percentage_discount?: number;
    cash_discount?: number;
    cashback_days?: number;
    last_updated_time?: string;
    flag_decision_cheapest_offer?: boolean;
    flag_decision_most_economical_offer?: boolean;
    flag_decision_sole_supplier?: boolean;
    flag_decision_contract_partner?: boolean;
    flag_decision_preferred_supplier_list?: boolean;
    flag_decision_other_reasons?: boolean;
    decision_other_reasons_description?: string;
    dfg_key?: string;
    delivery_address_id?: number;
    invoice_address_id?: number;
};
export namespace OrderResponseDTO {
    export enum status {
        ABR = 'ABR',
        ABS = 'ABS',
        ARC = 'ARC',
        DEL = 'DEL',
        INB = 'INB',
    }
}
