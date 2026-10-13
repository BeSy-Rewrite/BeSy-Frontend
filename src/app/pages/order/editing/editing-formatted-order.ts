import {
  CostCenterResponseDTO,
  CurrencyResponseDTO,
  OrderStatus,
  PersonResponseDTO,
  SupplierResponseDTO,
} from '../../../api-services-v2';
import { AutocompleteOption } from '../../../form-config-patching/autocomplete-option';

export interface EditingFormattedOrder {
  id: number;
  primary_cost_center_id?: AutocompleteOption<CostCenterResponseDTO>;
  booking_year?: string; //
  auto_index?: number;
  created_date?: string;
  legacy_alias?: string;
  owner_id?: number;
  content_description?: string; // Beschreibung der Bestellung
  status?: OrderStatus;
  currency?: AutocompleteOption<CurrencyResponseDTO>;
  comment?: string;
  comment_for_supplier?: string;
  quote_number?: string; // Angebotsnummer
  quote_sign?: string;
  quote_date?: string;
  quote_price?: string;
  delivery_person_id?: AutocompleteOption<PersonResponseDTO>;
  invoice_person_id?: AutocompleteOption<PersonResponseDTO>;
  queries_person_id?: AutocompleteOption<PersonResponseDTO>;
  customer_id?: string;
  supplier_id?: AutocompleteOption<SupplierResponseDTO>;
  secondary_cost_center_id?: AutocompleteOption<CostCenterResponseDTO>;
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
}
