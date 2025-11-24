import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin, map, Observable, of } from 'rxjs';
import { ZodError } from 'zod';
import { environment } from '../../environments/environment';
import { OrderResponseDTO, OrderStatus } from '../api-services-v2';
import { STATE_DISPLAY_NAMES } from '../display-name-mappings/status-names';
import { ValidCompletedOrder } from '../models/valid-completed-order';
import { AuthenticationService } from './authentication.service';
import { StateWrapperService } from './wrapper-services/state-wrapper.service';

@Injectable({
  providedIn: 'root'
})
export class OrderStateValidityService {

  constructor(private readonly stateService: StateWrapperService,
    private readonly authService: AuthenticationService,
    private readonly _snackbar: MatSnackBar
  ) { }

  /**
   * Validates if the state transition for the given order to the target state is valid.
   * This includes checking if the transition is allowed, if the user has the required permissions,
   * and if the order has the necessary fields for the transition.
   * @param order The order to validate.
   * @param targetState The target state to transition to.
   * @returns An Observable that emits the order if the transition is valid, or throws an error otherwise.
   */
  canTransitionToState(order: OrderResponseDTO, targetState: OrderStatus) {
    return forkJoin({
      isValidTransition: this.isStateTransitionValid(order.status!, targetState),
      hasValidPermissions: this.isUserAuthorizedForStatusChange(order.status!, targetState),
      validFields: this.verifyOrderCompletion(order, targetState)
    }).pipe(
      map(({ validFields }) => validFields)
    );
  }

  /**
   * Checks if the state transition from currentState to targetState is valid.
   * @param currentState The current state of the order.
   * @param targetState The target state to transition to.
   * @returns An Observable that emits true if the transition is valid, or throws an error otherwise.
   */
  isStateTransitionValid(currentState: OrderStatus, targetState: OrderStatus): Observable<boolean> {
    return this.stateService.getAllowedStateTransitions().pipe(
      map(transitions => {
        const allowedNextStates = transitions[currentState];
        return allowedNextStates?.includes(targetState) ?? false;
      }),
      map(isValid => {
        if (isValid) {
          return true;
        } else {
          console.warn(`Invalid state transition from ${currentState} to ${targetState}`);
          this._snackbar.open(`Statusübergang von ${STATE_DISPLAY_NAMES.get(currentState)} zu \
          ${STATE_DISPLAY_NAMES.get(targetState)} ist nicht erlaubt.`, 'Schließen', { duration: 5000 });
          throw new Error('Invalid state transition');
        }
      })
    );
  }

  /**
   * Checks if the order has the required fields for the state transition.
   * @param order The order to check.
   * @param targetState The target state of the order.
   * @returns An Observable that emits the order if it has the required fields, or throws an error otherwise.
   */
  verifyOrderCompletion(order: OrderResponseDTO, targetState: OrderStatus) {
    if (order.status === OrderStatus.IN_PROGRESS && targetState === OrderStatus.COMPLETED) {
      return of(ValidCompletedOrder.safeParse(order)).pipe(
        map(result => {
          if (result.success) {
            return order;
          } else {
            throw new ZodError(result.error.issues);
          }
        })
      );
    }
    return of(order);
  }

  /**
   * Checks if the user has the required permissions for the state transition.
   * @param currentState The current state of the order.
   * @param targetState The target state of the order.
   * @returns An Observable that emits true if the user has the required permissions, or throws an error otherwise.
   */
  isUserAuthorizedForStatusChange(currentState: OrderStatus, targetState: OrderStatus): Observable<boolean> {
    return of((currentState === OrderStatus.APPROVALS_RECEIVED && targetState === OrderStatus.APPROVED) ?
      this.authService.isAuthorized() && this.authService.isAuthorizedFor(environment.approveOrdersRole) :
      this.authService.isAuthorized()
    ).pipe(
      map(hasPermission => {
        if (hasPermission) {
          return true;
        } else {
          console.warn(`User lacks permissions for state transition from ${currentState} to ${targetState}`);
          this._snackbar.open(`Sie haben nicht die erforderlichen Berechtigungen, \
            um den Status von ${STATE_DISPLAY_NAMES.get(currentState)} zu ${STATE_DISPLAY_NAMES.get(targetState)} zu ändern.`, 'Schließen', { duration: 5000 });
          throw new Error('Insufficient permissions for state transition');
        }
      })
    );
  }
}
