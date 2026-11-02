import { VatResponseDTO } from '../../../../../api-services-v2';

export interface ItemTableModel {
  position?: number;
  item_id?: number;
  name: string;
  price_per_unit: number;
  quantity: number;
  quantity_unit?: string;
  article_id?: string;
  comment?: string;
  vat_value?: number;
  vat?: VatResponseDTO;
  preferred_list?: 'RZ' | 'TA';
  preferred_list_number?: string;
  vat_type: 'netto' | 'brutto';
}
