/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type OrderRequestDTO = {
    primary_cost_center_id: string;
    booking_year: string;
    legacy_alias?: string;
    owner_id?: number;
    content_description?: string;
    currency_short?: string;
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
    cashback_percentage?: number;
    cashback_days?: number;
    last_updated_time?: string;
    flag_decision_cheapest_offer?: boolean;
    flag_decision_sole_supplier?: boolean;
    flag_decision_contract_partner?: boolean;
    flag_decision_other_reasons?: boolean;
    decision_other_reasons_description?: string;
    flag_edv_permission?: boolean;
    flag_furniture_permission?: boolean;
    flag_furniture_room?: boolean;
    flag_investment_room?: boolean;
    flag_investment_structural_measures?: boolean;
    flag_media_permission?: boolean;
    dfg_key?: string;
};

