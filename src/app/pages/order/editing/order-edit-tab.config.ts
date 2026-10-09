export enum OrderEditTabIdentifier {
  GENERAL = 'general',
  ITEMS = 'items',
  MAIN_OFFER = 'mainOffer',
  QUOTATIONS = 'quotations',
  ADDRESSES = 'addresses',
  APPROVALS = 'approvals',
  DOCUMENTS = 'documents',
}

export type OrderEditTab = {
  identifier: OrderEditTabIdentifier;
  label: string;
};

export const ORDER_EDITING_TAB_NAMES: Record<OrderEditTabIdentifier, string> = {
  [OrderEditTabIdentifier.GENERAL]: 'Allgemeine Angaben',
  [OrderEditTabIdentifier.ITEMS]: 'Bestellpositionen',
  [OrderEditTabIdentifier.MAIN_OFFER]: 'Hauptangebot festlegen',
  [OrderEditTabIdentifier.QUOTATIONS]: 'Vergleichsangebote',
  [OrderEditTabIdentifier.ADDRESSES]: 'Adressdaten',
  [OrderEditTabIdentifier.APPROVALS]: 'Zustimmungen',
  [OrderEditTabIdentifier.DOCUMENTS]: 'Dokumente',
};

export const ORDER_EDITING_TABS: OrderEditTab[] = Object.values(OrderEditTabIdentifier).map(
  identifier => ({ identifier, label: ORDER_EDITING_TAB_NAMES[identifier] })
);
