import { TableColumn } from "../models/generic-table";


export type OrdersTableConfig = TableColumn[];

export const ordersTableConfig: OrdersTableConfig = [
    // Columns from old BeSy -> visible + sortable if supported by the backend
    { id: 'id', label: 'BeSy ID' },
    { id: 'besy_number', label: 'Bestellnummer', isUnsortable: true },
    { id: 'status', label: 'Status' },
    { id: 'content_description', label: 'Beschreibung', isUnsortable: true },
    { id: 'primary_cost_center_id', label: 'Kostenstelle' },
    { id: 'supplier_id', label: 'Lieferant' },
    { id: 'last_updated_time', label: 'Änderungsdatum' },

    // Not part of FilterRequestParams -> invisible + unsortable
    { id: 'auto_index', label: 'Auto-Index', isInvisible: true, isUnsortable: true },
    { id: 'legacy_alias', label: 'Alte Bezeichnung', isInvisible: true, isUnsortable: true },
    { id: 'currency', label: 'Währung', isInvisible: true, isUnsortable: true },
    { id: 'comment', label: 'Kommentar', isInvisible: true, isUnsortable: true },
    { id: 'comment_for_supplier', label: 'Kommentar an Lieferanten', isInvisible: true, isUnsortable: true },
    { id: 'quote_number', label: 'Angebotsnummer', isInvisible: true, isUnsortable: true },
    { id: 'quote_sign', label: 'Angebotszeichen', isInvisible: true, isUnsortable: true },
    { id: 'quote_date', label: 'Angebotsdatum', isInvisible: true, isUnsortable: true },
    { id: 'fixed_discount', label: 'Fixrabatt', isInvisible: true, isUnsortable: true },
    { id: 'percentage_discount', label: 'Prozentualer Rabatt', isInvisible: true, isUnsortable: true },
    { id: 'cash_discount', label: 'Skonto', isInvisible: true, isUnsortable: true },
    { id: 'cashback_days', label: 'Skontotage', isInvisible: true, isUnsortable: true },
    { id: 'flag_decision_cheapest_offer', label: 'Entscheidung: Günstigstes Angebot', isInvisible: true, isUnsortable: true },
    { id: 'flag_decision_sole_supplier', label: 'Entscheidung: Alleinlieferant', isInvisible: true, isUnsortable: true },
    { id: 'flag_decision_contract_partner', label: 'Entscheidung: Vertragspartner', isInvisible: true, isUnsortable: true },
    { id: 'flag_decision_other_reasons', label: 'Entscheidung: Andere Gründe', isInvisible: true, isUnsortable: true },
    { id: 'decision_other_reasons_description', label: 'Begründung andere Gründe', isInvisible: true, isUnsortable: true },
    { id: 'flag_edv_permission', label: 'RZ/EDV-Genehmigung', isInvisible: true, isUnsortable: true },
    { id: 'flag_furniture_permission', label: 'FM/Möbel-Genehmigung', isInvisible: true, isUnsortable: true },
    { id: 'flag_furniture_room', label: 'Möbel Platz vorhanden', isInvisible: true, isUnsortable: true },
    { id: 'flag_investment_room', label: 'Geräte Platz vorhanden', isInvisible: true, isUnsortable: true },
    { id: 'flag_investment_structural_measures', label: 'Investition: Bauliche Maßnahmen', isInvisible: true, isUnsortable: true },
    { id: 'flag_media_permission', label: 'Medientechnik Genehmigung', isInvisible: true, isUnsortable: true },
    { id: 'dfg_key', label: 'DFG-Schlüssel', isInvisible: true, isUnsortable: true },

    // Part of FilterRequestParams -> invisible/sortable by default
    { id: 'booking_year', label: 'Buchungsjahr', isInvisible: true },
    { id: 'created_date', label: 'Erstellt am', isInvisible: true },
    { id: 'owner_id', label: 'Erstellt von', isInvisible: true },
    { id: 'quote_price', label: 'Preis', isInvisible: true },
    { id: 'delivery_person_id', label: 'Bestellt für', isInvisible: true },
    { id: 'invoice_person_id', label: 'Rechnungsempfänger:in', isInvisible: true },
    { id: 'queries_person_id', label: 'Ansprechperson', isInvisible: true },
    { id: 'customer_id', label: 'Kundennummer', isInvisible: true },
    { id: 'secondary_cost_center_id', label: 'Sekundäre Kostenstelle', isInvisible: true },
];
