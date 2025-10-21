import { Injectable } from '@angular/core';
import { from, map } from 'rxjs';
import { OrdersService } from '../../api';
import { AllowedStateTransitions } from '../../models/allowed-states-transitions';


@Injectable({
  providedIn: 'root'
})
export class StateWrapperService {

  /**
   * Retrieves the allowed state transitions for orders.
   * @returns An observable of AllowedStateTransitions mapping current states to possible next states.
   */
  getAllowedStateTransitions() {
    return from(OrdersService.getOrdersStatuses()).pipe(
      map(statuses => statuses as AllowedStateTransitions)
    );
  }
}
