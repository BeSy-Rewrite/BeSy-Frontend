import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, from, map, Observable, switchMap } from 'rxjs';
import { OrderResponseDTO } from '../api-services-v2';
import { DisplayableOrder } from '../models/displayable-order';
import { OrderSubresourceResolverService } from '../services/order-subresource-resolver.service';
import { OrdersWrapperService } from '../services/wrapper-services/orders/orders-wrapper.service';

@Injectable({
  providedIn: 'root',
})
export class OrderResolver implements Resolve<DisplayableOrder> {
  constructor(
    private readonly ordersService: OrdersWrapperService,
    private readonly orderDisplayService: OrderSubresourceResolverService,
    private readonly router: Router
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<DisplayableOrder> {
    const id = route.paramMap.get('id')!;
    let observable: Observable<OrderResponseDTO>;

    if (id.includes('-')) {
      observable = from(this.ordersService.getOrderByOrderNumber(id)).pipe(
        catchError(() => {
          console.warn(`Order with order number ${id} not found, falling back to ID lookup.`);
          return from(this.ordersService.getOrderById(Number.parseInt(id)));
        })
      );
    } else {
      observable = from(this.ordersService.getOrderById(Number.parseInt(id)));
    }

    return observable.pipe(
      catchError(error => {
        console.error(`Failed to fetch order with id ${id}:`, error);
        this.router.navigate(['/not-found'], { skipLocationChange: true });
        throw error;
      }),
      switchMap(order =>
        this.orderDisplayService
          .resolveOrderSubresources(order)
          .pipe(map(orderDisplay => ({ order, orderDisplay })))
      )
    );
  }
}
