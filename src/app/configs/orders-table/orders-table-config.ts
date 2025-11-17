import { ORDER_FIELD_NAMES } from "../../display-name-mappings/order-names";
import { TableColumn } from "../../models/generic-table";

export type OrdersTableConfig = TableColumn[];

export const ordersTableConfig: OrdersTableConfig = [
    // \u00A0 is a non-breaking space to prevent breaking in the middle of the label
    // Columns from old BeSy -> visible + sortable if supported by the backend
    { id: 'besy_number', label: ORDER_FIELD_NAMES["besy_number"], isUnsortable: true },
    { id: 'id', label: ORDER_FIELD_NAMES["id"].replace(' ', '\u00A0'), isInvisible: true },
    { id: 'status', label: ORDER_FIELD_NAMES["status"] },
    { id: 'content_description', label: ORDER_FIELD_NAMES["content_description"], isUnsortable: true },
    { id: 'primary_cost_center_id', label: ORDER_FIELD_NAMES["primary_cost_center_id"] },
    { id: 'supplier_id', label: ORDER_FIELD_NAMES["supplier_id"] },
    { id: 'last_updated_time', label: ORDER_FIELD_NAMES["last_updated_time"] },

    // Not part of FilterRequestParams -> invisible + unsortable
    { id: 'auto_index', label: ORDER_FIELD_NAMES["auto_index"], isInvisible: true, isUnsortable: true },
    { id: 'legacy_alias', label: ORDER_FIELD_NAMES["legacy_alias"], isInvisible: true, isUnsortable: true },
    { id: 'currency', label: ORDER_FIELD_NAMES["currency"], isInvisible: true, isUnsortable: true },
    { id: 'comment', label: ORDER_FIELD_NAMES["comment"], isInvisible: true, isUnsortable: true },
    { id: 'comment_for_supplier', label: ORDER_FIELD_NAMES["comment_for_supplier"], isInvisible: true, isUnsortable: true },
    { id: 'quote_number', label: ORDER_FIELD_NAMES["quote_number"], isInvisible: true, isUnsortable: true },
    { id: 'quote_sign', label: ORDER_FIELD_NAMES["quote_sign"], isInvisible: true, isUnsortable: true },
    { id: 'quote_date', label: ORDER_FIELD_NAMES["quote_date"], isInvisible: true, isUnsortable: true },
    { id: 'fixed_discount', label: ORDER_FIELD_NAMES["fixed_discount"], isInvisible: true, isUnsortable: true },
    { id: 'percentage_discount', label: ORDER_FIELD_NAMES["percentage_discount"], isInvisible: true, isUnsortable: true },
    { id: 'cash_discount', label: ORDER_FIELD_NAMES["cash_discount"], isInvisible: true, isUnsortable: true },
    { id: 'cashback_days', label: ORDER_FIELD_NAMES["cashback_days"], isInvisible: true, isUnsortable: true },
    { id: 'flag_decision_cheapest_offer', label: ORDER_FIELD_NAMES["flag_decision_cheapest_offer"], isInvisible: true, isUnsortable: true },
    { id: 'flag_decision_sole_supplier', label: ORDER_FIELD_NAMES["flag_decision_sole_supplier"], isInvisible: true, isUnsortable: true },
    { id: 'flag_decision_contract_partner', label: ORDER_FIELD_NAMES["flag_decision_contract_partner"], isInvisible: true, isUnsortable: true },
    { id: 'flag_decision_other_reasons', label: ORDER_FIELD_NAMES["flag_decision_other_reasons"], isInvisible: true, isUnsortable: true },
    { id: 'decision_other_reasons_description', label: ORDER_FIELD_NAMES["decision_other_reasons_description"], isInvisible: true, isUnsortable: true },
    { id: 'dfg_key', label: ORDER_FIELD_NAMES["dfg_key"], isInvisible: true, isUnsortable: true },

    // Part of FilterRequestParams -> invisible/sortable by default
    { id: 'booking_year', label: ORDER_FIELD_NAMES["booking_year"], isInvisible: true },
    { id: 'created_date', label: ORDER_FIELD_NAMES["created_date"], isInvisible: true },
    { id: 'owner_id', label: ORDER_FIELD_NAMES["owner_id"].replace(' ', '\u00A0'), isInvisible: true },
    { id: 'quote_price', label: ORDER_FIELD_NAMES["quote_price"], isInvisible: true },
    { id: 'delivery_person_id', label: ORDER_FIELD_NAMES["delivery_person_id"].replace(' ', '\u00A0'), isInvisible: true },
    { id: 'invoice_person_id', label: ORDER_FIELD_NAMES["invoice_person_id"], isInvisible: true },
    { id: 'queries_person_id', label: ORDER_FIELD_NAMES["queries_person_id"], isInvisible: true },
    { id: 'customer_id', label: ORDER_FIELD_NAMES["customer_id"], isInvisible: true },
    { id: 'secondary_cost_center_id', label: ORDER_FIELD_NAMES["secondary_cost_center_id"], isInvisible: true },
];
