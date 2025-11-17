import { InvoiceResponseDTO } from "../api-services-v2";

export const INVOICE_FIELD_NAMES: Record<keyof InvoiceResponseDTO, string> = {
    id: 'Dokumenten-ID',
    cost_center_id: 'Kostenstelle',
    order_id: 'Bestellung',
    price: 'Preis',
    date: 'Dokumentdatum',
    comment: 'Kommentar',
    created_date: 'Erstellungsdatum',
    paperless_id: 'Paperless ID'
};
