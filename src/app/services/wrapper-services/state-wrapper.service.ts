import { Injectable } from '@angular/core';
import { from, map } from 'rxjs';
import { OrdersService } from '../../api';
import { AllowedStateTransitions } from '../../models/allowed-states-transitions';


@Injectable({
  providedIn: 'root'
})
export class StateWrapperService {

  getAllowedStateTransitions() {
    return from(OrdersService.getOrdersStatuses()).pipe(
      map(statuses => statuses as AllowedStateTransitions)
    );
  }
}
