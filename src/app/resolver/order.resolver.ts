import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot
} from '@angular/router';
import { from, map, Observable, switchMap } from 'rxjs';
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
    const id = Number.parseInt(route.paramMap.get('id')!);
    return from(this.ordersService.getOrderById(id)).pipe(
      switchMap(order =>
        this.orderDisplayService.resolveOrderSubresources(order).pipe(
          map(orderDisplay => ({ order, orderDisplay }))
        )
      )
    );
  }
}
