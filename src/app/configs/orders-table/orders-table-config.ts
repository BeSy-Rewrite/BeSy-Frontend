import { ORDER_FIELD_NAMES } from "../../display-name-mappings/order-names";
import { TableColumn } from "../../models/generic-table";

export type OrdersTableConfig = TableColumn[];

export const ordersTableConfig: OrdersTableConfig = [
    // \u00A0 is a non-breaking space to prevent breaking in the middle of the label
    // Columns from old BeSy -> visible
    { id: 'id', label: ORDER_FIELD_NAMES["id"].replace(' ', '\u00A0'), isInvisible: true },
    { id: 'besy_number', label: ORDER_FIELD_NAMES["besy_number"] },
    { id: 'status', label: ORDER_FIELD_NAMES["status"] },
    { id: 'content_description', label: ORDER_FIELD_NAMES["content_description"] },
    { id: 'primary_cost_center_id', label: ORDER_FIELD_NAMES["primary_cost_center_id"] },
    { id: 'supplier_id', label: ORDER_FIELD_NAMES["supplier_id"] },
    { id: 'last_updated_time', label: ORDER_FIELD_NAMES["last_updated_time"] },

    // Part of FilterRequestParams -> invisible by default
    { id: 'auto_index', label: ORDER_FIELD_NAMES["auto_index"], isInvisible: true },
    { id: 'booking_year', label: ORDER_FIELD_NAMES["booking_year"], isInvisible: true },
    { id: 'created_date', label: ORDER_FIELD_NAMES["created_date"], isInvisible: true },
    { id: 'owner_id', label: ORDER_FIELD_NAMES["owner_id"].replace(' ', '\u00A0'), isInvisible: true },
    { id: 'quote_price', label: ORDER_FIELD_NAMES["quote_price"], isInvisible: true },
    { id: 'delivery_person_id', label: ORDER_FIELD_NAMES["delivery_person_id"].replace(' ', '\u00A0'), isInvisible: true },
    { id: 'invoice_person_id', label: ORDER_FIELD_NAMES["invoice_person_id"], isInvisible: true },
    { id: 'queries_person_id', label: ORDER_FIELD_NAMES["queries_person_id"], isInvisible: true },
    { id: 'customer_id', label: ORDER_FIELD_NAMES["customer_id"], isInvisible: true },
    { id: 'secondary_cost_center_id', label: ORDER_FIELD_NAMES["secondary_cost_center_id"], isInvisible: true },
    { id: 'legacy_alias', label: ORDER_FIELD_NAMES["legacy_alias"], isInvisible: true },
    { id: 'currency', label: ORDER_FIELD_NAMES["currency"], isInvisible: true },
    { id: 'comment', label: ORDER_FIELD_NAMES["comment"], isInvisible: true },
    { id: 'comment_for_supplier', label: ORDER_FIELD_NAMES["comment_for_supplier"], isInvisible: true },
    { id: 'quote_number', label: ORDER_FIELD_NAMES["quote_number"], isInvisible: true },
    { id: 'quote_sign', label: ORDER_FIELD_NAMES["quote_sign"], isInvisible: true },
    { id: 'quote_date', label: ORDER_FIELD_NAMES["quote_date"], isInvisible: true },
    { id: 'fixed_discount', label: ORDER_FIELD_NAMES["fixed_discount"], isInvisible: true },
    { id: 'percentage_discount', label: ORDER_FIELD_NAMES["percentage_discount"], isInvisible: true },
    { id: 'cash_discount', label: ORDER_FIELD_NAMES["cash_discount"], isInvisible: true },
    { id: 'cashback_days', label: ORDER_FIELD_NAMES["cashback_days"], isInvisible: true },
    { id: 'flag_decision_cheapest_offer', label: ORDER_FIELD_NAMES["flag_decision_cheapest_offer"], isInvisible: true },
    { id: 'flag_decision_sole_supplier', label: ORDER_FIELD_NAMES["flag_decision_sole_supplier"], isInvisible: true },
    { id: 'flag_decision_contract_partner', label: ORDER_FIELD_NAMES["flag_decision_contract_partner"], isInvisible: true },
    { id: 'flag_decision_other_reasons', label: ORDER_FIELD_NAMES["flag_decision_other_reasons"], isInvisible: true },
    { id: 'decision_other_reasons_description', label: ORDER_FIELD_NAMES["decision_other_reasons_description"], isInvisible: true },
    { id: 'dfg_key', label: ORDER_FIELD_NAMES["dfg_key"], isInvisible: true },
];
