import { inject, Injectable } from '@angular/core';
import { from, Observable, of, switchMap } from 'rxjs';
import { OrderResponseDTO } from '../../../../api-services-v2';
import { OrdersWrapperService } from '../../../../services/wrapper-services/orders/orders-wrapper.service';
import { EditingFormattedOrder } from '../editing-formatted-order';
import { EditOrderFormattingService } from '../loading/edit-order-formatting.service';

@Injectable({
  providedIn: 'root',
})
export class OrderSaveService {
  private readonly ordersService = inject(OrdersWrapperService);
  private readonly formattingService = inject(EditOrderFormattingService);

  /** Diff + patch the "core" order fields (general, main offer, etc.) */
  saveOrderFields(
    original: EditingFormattedOrder,
    formValues: Partial<EditingFormattedOrder>
  ): Observable<EditingFormattedOrder> {
    const requestPatch = this.mapFormValuesToRequestPatch(original, formValues);
    if (Object.keys(requestPatch).length === 0) {
      return of(original); // no-op, let caller decide how to notify
    }
    return from(this.ordersService.patchOrderById(original.id, requestPatch)).pipe(
      switchMap(updatedOrder => this.formattingService.formatOrderData(updatedOrder))
    );
  }

  private mapFormValuesToRequestPatch(
    _original: EditingFormattedOrder,
    _formValues: Partial<EditingFormattedOrder>
  ): OrderResponseDTO {
    /* unwrap AutocompleteOptions, diff vs original */
  }
}
