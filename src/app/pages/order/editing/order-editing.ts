import { OrderEditTabIdentifier } from './order-edit-tab.config';

export const ORDER_EDITING_TAB_NAMES: Record<OrderEditTabIdentifier, string> = {
  [OrderEditTabIdentifier.GENERAL]: 'Allgemeine Angaben',
  [OrderEditTabIdentifier.ITEMS]: 'Bestellpositionen',
  [OrderEditTabIdentifier.MAIN_OFFER]: 'Hauptangebot festlegen',
  [OrderEditTabIdentifier.QUOTATIONS]: 'Vergleichsangebote',
  [OrderEditTabIdentifier.ADDRESSES]: 'Adressdaten',
  [OrderEditTabIdentifier.APPROVALS]: 'Zustimmungen',
  [OrderEditTabIdentifier.DOCUMENTS]: 'Dokumente',
};
