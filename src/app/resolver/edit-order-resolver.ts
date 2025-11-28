import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { catchError, EMPTY, from, map, Observable, switchMap } from 'rxjs';
import { OrderResponseDTO } from '../api-services-v2';
import { OrderResponseDTOFormatted, OrdersWrapperService } from '../services/wrapper-services/orders-wrapper.service';

export interface EditOrderResolvedData {
  order: OrderResponseDTO;
  formattedOrder: OrderResponseDTOFormatted;
}

@Injectable({
  providedIn: 'root'
})
export class EditOrderResolver implements Resolve<EditOrderResolvedData | null> {
  constructor(
    private readonly router: Router,
    private readonly ordersService: OrdersWrapperService,
  ) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<EditOrderResolvedData | null> {
    const idParam = route.paramMap.get('id');
    const id = Number.parseInt(idParam ?? '', 10);

    if (Number.isNaN(id)) {
      this.router.navigate(['/not-found'], { skipLocationChange: true });
      return EMPTY;
    }

    return from(this.ordersService.getOrderById(id)).pipe(
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
