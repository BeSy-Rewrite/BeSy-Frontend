import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot
} from '@angular/router';
import { from, map, Observable, switchMap } from 'rxjs';
import { OrderResponseDTO } from '../api-services-v2';
import { DisplayableOrder } from '../models/displayable-order';
import { OrderSubresourceResolverService } from '../services/order-subresource-resolver.service';
import { OrdersWrapperService } from '../services/wrapper-services/orders-wrapper.service';

@Injectable({
  providedIn: 'root'
})
export class OrderResolver implements Resolve<DisplayableOrder> {
  constructor(private readonly ordersService: OrdersWrapperService,
    private readonly orderDisplayService: OrderSubresourceResolverService
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<DisplayableOrder> {
    const id = route.paramMap.get('id')!;
    let observable: Observable<OrderResponseDTO>;

    if (id.includes('-')) {
      observable = from(this.ordersService.getOrderByOrderNumber(id));
    } else {
      observable = from(this.ordersService.getOrderById(Number.parseInt(id)))
    }

    return observable.pipe(
      switchMap(order =>
        this.orderDisplayService.resolveOrderSubresources(order).pipe(
          map(orderDisplay => ({ order, orderDisplay }))
        )
      )
    );
  }
}
