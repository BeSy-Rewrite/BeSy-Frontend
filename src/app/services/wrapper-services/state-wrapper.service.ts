import { Injectable } from '@angular/core';
import { from, map } from 'rxjs';
import { OrdersService } from '../../apiv2';
import { AllowedStateTransitions } from '../../models/allowed-states-transitions';


@Injectable({
  providedIn: 'root'
})
export class StateWrapperService {
  constructor(private readonly ordersService: OrdersService) { }

  /**
   * Retrieves the allowed state transitions for orders.
   * @returns An observable of AllowedStateTransitions mapping current states to possible next states.
   */
  getAllowedStateTransitions() {
    return from(this.ordersService.ordersStatusesGet()).pipe(
      map(statuses => statuses as AllowedStateTransitions)
    );
  }
}
