import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ItemRequestDTO, ItemResponseDTO, OrderControllerService } from '../../api-services-v2';

@Injectable({
  providedIn: 'root',
})
export class ItemService {
  private readonly orderService = inject(OrderControllerService);

  getAllItemsForOrder(orderId: number): Observable<ItemResponseDTO[]> {
    return this.orderService.getOrderItems(orderId);
  }

  bulkCreateItemsForOrder(
    orderId: number,
    itemRequestDTO: ItemRequestDTO[]
  ): Observable<ItemResponseDTO[]> {
    return this.orderService.createOrderItem(orderId, itemRequestDTO);
  }

  updateItemOfOrder(
    orderId: number,
    itemId: number,
    itemRequestDTO: ItemRequestDTO
  ): Observable<ItemResponseDTO> {
    return this.orderService.updateOrderItem(orderId, itemId, itemRequestDTO);
  }

  deleteItemOfOrder(orderId: number, itemId: number): Observable<void> {
    return this.orderService.deleteOrderItem(orderId, itemId);
  }
}
