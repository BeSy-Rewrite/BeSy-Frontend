import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, EMPTY, from, map, Observable, switchMap } from 'rxjs';
import { OrderResponseDTO } from '../api-services-v2';
import {
  OrderResponseDTOFormatted,
  OrdersWrapperService,
} from '../services/wrapper-services/orders-wrapper.service';

export interface EditOrderResolvedData {
  order: OrderResponseDTO;
  formattedOrder: OrderResponseDTOFormatted;
}

@Injectable({
  providedIn: 'root',
})
export class EditOrderResolver implements Resolve<EditOrderResolvedData | null> {
  constructor(
    private readonly router: Router,
    private readonly ordersService: OrdersWrapperService
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot
  ): Observable<EditOrderResolvedData | null> {
    const id = route.paramMap.get('id');

    if (!id) {
      this.router.navigate(['/not-found'], { skipLocationChange: true });
      return EMPTY;
    }

    let orderObservable: Observable<OrderResponseDTO>;

    if (id.includes('-')) {
      // Order number format (e.g., "KST-25-123")
      orderObservable = from(this.ordersService.getOrderByOrderNumber(id));
    } else {
      // Numeric ID format
      const numericId = Number.parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        this.router.navigate(['/not-found'], { skipLocationChange: true });
        return EMPTY;
      }
      orderObservable = from(this.ordersService.getOrderById(numericId));
    }

    return orderObservable.pipe(
      switchMap(order =>
        from(this.ordersService.mapOrderResponseToFormatted(order)).pipe(
          map(formattedOrder => ({ order, formattedOrder }))
        )
      ),
      catchError(error => {
        if (error?.status === 404) {
          this.router.navigate(['/not-found'], { skipLocationChange: true });
        } else {
          console.error('Error loading order for edit:', error);
          this.router.navigate(['/not-found'], { skipLocationChange: true });
        }
        return EMPTY;
      })
    );
  }
}
