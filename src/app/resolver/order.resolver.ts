import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot
} from '@angular/router';
import { from, map, Observable, switchMap } from 'rxjs';
import { OrderResponseDTO } from '../api';
import { OrderDisplayData } from '../models/order-display-data';
import { OrderSubresourceResolverService } from '../services/order-subresource-resolver.service';
import { OrdersWrapperService } from '../services/wrapper-services/orders-wrapper.service';

@Injectable({
  providedIn: 'root'
})
export class OrderResolver implements Resolve<{ order: OrderResponseDTO, orderDisplay: OrderDisplayData }> {
  constructor(private readonly ordersService: OrdersWrapperService,
    private readonly orderDisplayService: OrderSubresourceResolverService
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<{ order: OrderResponseDTO, orderDisplay: OrderDisplayData }> {
    const id = parseInt(route.paramMap.get('id')!);
    return from(this.ordersService.getOrderById(id)).pipe(
      switchMap(order =>
        this.orderDisplayService.resolveOrderSubresources(order).pipe(
          map(orderDisplay => {
            return { order, orderDisplay };
          })
        )
      )
    );
  }
}
