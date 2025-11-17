import { Injectable } from '@angular/core';
import { map, of, tap } from 'rxjs';
import { OrdersService } from '../../api-services-v2';
import { AllowedStateTransitions } from '../../models/allowed-states-transitions';


@Injectable({
  providedIn: 'root'
})
export class StateWrapperService {

  private stateTransitions: AllowedStateTransitions | undefined = undefined

  constructor(private readonly ordersService: OrdersService) { }

  /**
   * Retrieves the allowed state transitions for orders.
   * @returns An observable of AllowedStateTransitions mapping current states to possible next states.
   */
  getAllowedStateTransitions() {
    if (this.stateTransitions) {
      return of(this.stateTransitions);
    }
    return this.ordersService.getOrderStatusTransitions().pipe(
      map(statuses => statuses as AllowedStateTransitions),
      tap(transitions => this.stateTransitions = transitions)
    );
  }
}
