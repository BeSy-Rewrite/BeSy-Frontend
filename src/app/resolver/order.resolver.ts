import { Injectable } from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { from, map, Observable, of, tap } from 'rxjs';
import { OrderResponseDTO } from '../api';
import { OrdersWrapperService } from '../services/wrapper-services/orders-wrapper.service';

@Injectable({
  providedIn: 'root'
})
// ToDo: Change orderDisplay to real type after merging order display feature
export class OrderResolver implements Resolve<{order: OrderResponseDTO, orderDisplay: undefined}> {
  constructor(private readonly ordersService: OrdersWrapperService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<{order: OrderResponseDTO, orderDisplay: undefined}> {
    const id = parseInt(route.paramMap.get('id')!);
    return from(this.ordersService.getOrderById(id)).pipe(
      map(order => ({order, orderDisplay: undefined}))
    );
  }
}
