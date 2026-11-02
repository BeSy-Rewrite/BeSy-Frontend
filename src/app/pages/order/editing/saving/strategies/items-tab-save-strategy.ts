import { inject, Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { forkJoin, from, map, Observable, of, switchMap, tap } from 'rxjs';
import { ItemService } from '../../../../../services/wrapper-services/item.service';
import { EditingFormattedOrder } from '../../editing-formatted-order';
import { ItemTablemodelMapperService } from '../../tabs/order-edit-items/item-tablemodel-mapper.service';
import { OrderItemsStateService } from '../../tabs/order-edit-items/order-items-state.service';
import { OrderEditTabIdentifier } from '../../tabs/order-edit-tab.config';
import { TabSaveStrategy } from '../tab-save-strategy';

/**
 * Saves added/deleted/updated items of an order.
 * Injects the same `OrderItemsStateService` that is used in the Items tab component –
 * provided both are registered in the same injector (OrderEditComponent).
 */
@Injectable()
export class ItemsTabSaveStrategy implements TabSaveStrategy {
  readonly tabIdentifier = OrderEditTabIdentifier.ITEMS;

  private readonly itemsState = inject(OrderItemsStateService);
  private readonly itemService = inject(ItemService);
  private readonly itemTablemodelMapper = inject(ItemTablemodelMapperService);

  save(
    _formGroup: FormGroup,
    order: EditingFormattedOrder
  ): Observable<Partial<EditingFormattedOrder>> {
    const toCreate = this.itemsState.getPendingCreations();
    const toDelete = this.itemsState.getPendingDeletions();
    const toUpdate = this.itemsState.getPendingUpdates();

    if (toCreate.length === 0 && toDelete.length === 0 && toUpdate.length === 0) {
      return of({});
    }

    const createRequest$ =
      toCreate.length > 0
        ? from(
            this.itemService.bulkCreateItemsForOrder(
              order.id,
              toCreate.map(item =>
                this.itemTablemodelMapper.mapItemTableModelToItemRequestDTO(item)
              )
            )
          )
        : of(undefined);

    const deleteRequests$ = toDelete.map(item =>
      from(this.itemService.deleteItemOfOrder(order.id, item.item_id!))
    );

    const updateRequests$ = toUpdate.map(item =>
      from(
        this.itemService.updateItemOfOrder(
          order.id,
          item.item_id!,
          this.itemTablemodelMapper.mapItemTableModelToItemRequestDTO(item)
        )
      )
    );

    return forkJoin([createRequest$, ...deleteRequests$, ...updateRequests$]).pipe(
      // Nach Create/Delete: aktuellen Stand neu laden, um echte item_ids zu bekommen
      switchMap(() => from(this.itemService.getAllItemsForOrder(order.id))),
      map(responseItems => this.itemTablemodelMapper.mapItemResponseToTableModel(responseItems)),
      tap(persistedItems => this.itemsState.resetItemList(persistedItems)),
      // Items sind kein Feld von EditingFormattedOrder -> leeres Patch
      map(() => ({}) as Partial<EditingFormattedOrder>)
    );
  }

  revert(): void {
    this.itemsState.resetItemList();
  }
}
