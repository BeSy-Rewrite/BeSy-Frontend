import { Injectable } from '@angular/core';
import { ItemRequestDTO, ItemResponseDTO } from '../../../../../api-services-v2';
import { ItemTableModel } from './item-table-model';

/**
 * Service to map between ItemResponseDTO and ItemTableModel, and vice versa.
 * This is used to convert the data received from the backend into a format suitable for display in the UI,
 * and to convert the data from the UI back into a format suitable for sending to the backend.
 */
@Injectable({
  providedIn: 'root',
})
export class ItemTablemodelMapperService {
  mapItemResponseToTableModel(items: ItemResponseDTO[]): ItemTableModel[] {
    const sortedItems = [...items].sort((a, b) => (a.item_id ?? 0) - (b.item_id ?? 0));
    return sortedItems.map((item, i) => ({
      position: i + 1,
      item_id: item.item_id,
      name: item.name ?? '',
      price_per_unit: item.price_per_unit ?? 0,
      quantity: item.quantity ?? 0,
      quantity_unit: item.quantity_unit,
      article_id: item.article_id,
      comment: item.comment,
      vat_value: item.vat?.value,
      preferred_list: item.preferred_list,
      preferred_list_number: item.preferred_list_number,
      vat_type: item.vat_type ?? 'netto',
    }));
  }

  mapItemTableModelToItemRequestDTO(item: ItemTableModel): ItemRequestDTO {
    return {
      name: item.name,
      price_per_unit: item.price_per_unit,
      quantity: item.quantity ?? 0,
      quantity_unit: item.quantity_unit,
      article_id: item.article_id,
      comment: item.comment,
      vat_value: item.vat_value ?? 0,
      // preferred_list is optional in both models; cast to match generated enum type
      preferred_list: item.preferred_list as ItemRequestDTO.PreferredListEnum | undefined,
      preferred_list_number: item.preferred_list_number,
      // cast vat_type to the generated enum type ('netto' | 'brutto')
      vat_type: item.vat_type as ItemRequestDTO.VatTypeEnum,
    };
  }
}
