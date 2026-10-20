import { OrderStatus } from '../../../../api-services-v2';

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
  enabledStates: OrderStatus[];
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

export const ORDER_EDITING_TAB_STATE_MAP: Record<OrderEditTabIdentifier, OrderStatus[]> = {
  [OrderEditTabIdentifier.GENERAL]: [OrderStatus.IN_PROGRESS],
  [OrderEditTabIdentifier.ITEMS]: [OrderStatus.IN_PROGRESS],
  [OrderEditTabIdentifier.MAIN_OFFER]: [OrderStatus.IN_PROGRESS],
  [OrderEditTabIdentifier.QUOTATIONS]: [OrderStatus.IN_PROGRESS],
  [OrderEditTabIdentifier.ADDRESSES]: [OrderStatus.IN_PROGRESS],
  [OrderEditTabIdentifier.APPROVALS]: [OrderStatus.IN_PROGRESS, OrderStatus.COMPLETED],
  [OrderEditTabIdentifier.DOCUMENTS]: [], // Documents tab is always available, regardless of order status
};

export const ORDER_EDITING_TABS: OrderEditTab[] = Object.values(OrderEditTabIdentifier).map(
  identifier => ({
    identifier,
    label: ORDER_EDITING_TAB_NAMES[identifier],
    enabledStates: ORDER_EDITING_TAB_STATE_MAP[identifier],
  })
);
