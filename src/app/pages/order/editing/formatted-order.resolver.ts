import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { catchError, from, Observable, switchMap, throwError } from 'rxjs';
import { OrderResponseDTO } from '../../../api-services-v2';
import { OrdersWrapperService } from '../../../services/wrapper-services/orders/orders-wrapper.service';
import { EditOrderFormattingService } from './edit-order-formatting.service';
import { EditingFormattedOrder } from './editing-formatted-order';

export const formattedOrderResolver: ResolveFn<EditingFormattedOrder> = (
  route
): Observable<EditingFormattedOrder> => {
  const ordersService = inject(OrdersWrapperService);
  const orderFormattingService = inject(EditOrderFormattingService);
  const router = inject(Router);

  const id = route.paramMap.get('id')!;
  let observable: Observable<OrderResponseDTO>;

  if (id.includes('-')) {
    observable = from(ordersService.getOrderByOrderNumber(id));
  } else {
    observable = from(ordersService.getOrderById(Number.parseInt(id)));
  }

  return observable.pipe(
    catchError(error => {
      console.error(`Failed to fetch order with id ${id}:`, error);
      void router.navigate(['/not-found'], { skipLocationChange: true });
      return throwError(
        () => new Error(`Failed to fetch order with id ${id} with error: ${error.message}`)
      );
    }),
    switchMap(order => orderFormattingService.formatOrderData(order))
  );
};
