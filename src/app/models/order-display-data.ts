
/**
 * Type representing the display data for an order.
 * Contains all relevant fields for showing order information in the UI.
 */
export type OrderDisplayData = {
    id: string;
    besy_number: string;
    primary_cost_center_id: string;
    booking_year: string;
    auto_index: number | string;
    created_date: string;
    legacy_alias: string;
    owner_id: string;
    content_description: string;
    status: string;
    currency: string;
    comment: string;
    comment_for_supplier: string;
    quote_number: string;
    quote_sign: string;
    quote_date: string;
    quote_price: string;
    delivery_person_id: string;
    invoice_person_id: string;
    queries_person_id: string;
    customer_id: string;
    supplier_id: string;
    secondary_cost_center_id: string;
    fixed_discount: string;
    percentage_discount: string;
    cash_discount: string;
    cashback_days: string;
    last_updated_time: string;
    flag_decision_cheapest_offer: string;
    flag_decision_most_economical_offer?: string;
    flag_decision_sole_supplier: string;
    flag_decision_contract_partner: string;
    flag_decision_preferred_supplier_list?: string;
    flag_decision_other_reasons: string;
    decision_other_reasons_description: string;
    dfg_key: string;
    delivery_address_id?: number;
    invoice_address_id?: number;
    tooltips?: { [K in keyof Partial<Omit<OrderDisplayData, 'tooltips'>>]: string };
};
