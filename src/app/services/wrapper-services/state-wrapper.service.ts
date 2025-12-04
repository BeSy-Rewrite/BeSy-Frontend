import { Injectable } from '@angular/core';
import { map, Observable, of, tap } from 'rxjs';
import { OrdersService, OrderStatus } from '../../api-services-v2';
import { AllowedStateTransitions } from '../../models/allowed-states-transitions';


@Injectable({
  providedIn: 'root'
})
export class StateWrapperService {

  private stateTransitions: AllowedStateTransitions | undefined = undefined;
  private longestStateSequence: OrderStatus[] | undefined = undefined;
  private readonly initialState = OrderStatus.IN_PROGRESS;
  private skippableStates: OrderStatus[] | undefined;

  constructor(private readonly ordersService: OrdersService) { }

  /**
   * Retrieves the allowed state transitions for orders.
   * @returns An observable of AllowedStateTransitions mapping current states to possible next states.
   */
  getAllowedStateTransitions(): Observable<AllowedStateTransitions> {
    if (this.stateTransitions) {
      return of(this.stateTransitions);
    }
    return this.ordersService.getOrderStatusTransitions().pipe(
      map(statuses => statuses as AllowedStateTransitions),
      tap(transitions => this.stateTransitions = transitions)
    );
  }

  /**
   * Retrieves the longest sequence of valid order states.
   * @returns An observable of an array of OrderStatus representing the longest sequence.
   */
  getLongestSequenceOfStates(): Observable<OrderStatus[]> {
    if (this.longestStateSequence) {
      return of(this.longestStateSequence);
    }
    return this.getAllowedStateTransitions().pipe(
      map(() => this.determineNextStateInLongestSequence()[0] ?? [this.initialState]),
      tap(sequence => this.longestStateSequence = sequence)
    );
  }

  /**
   * Retrieves the states that can be skipped in the order process.
   * @returns An array of skippable OrderStatus.
   */
  getSkippableStates(): OrderStatus[] {
    if (this.skippableStates) {
      return this.skippableStates;
    }
    this.setupSkippableStates(this.determineNextStateInLongestSequence());
    return this.skippableStates!;
  }

  /**
   * Determine which states are skippable based on the sequences.
   * @param sequences The sequences of order states.
   */
  private setupSkippableStates(sequences: OrderStatus[][]) {
    const longestSequence = sequences[0];
    const shorterSequences = sequences.slice(1);
    this.skippableStates = [];

    for (const state of longestSequence) {
      let isSkippable = false;
      for (const seq of shorterSequences) {
        if (seq.at(-1) === longestSequence.at(-1) && !seq.includes(state)) {
          isSkippable = true;
          break;
        }
      }
      if (isSkippable) {
        this.skippableStates.push(state);
      }
    }
  }

  /**
   * Recursively determine the next state in the longest valid sequence.
   * @param states Current sequence of states.
   * @returns The longest sequence of states including the next valid state.
   */
  private determineNextStateInLongestSequence(states: OrderStatus[] = [this.initialState]): OrderStatus[][] {
    const lastState = states.at(-1);
    if (!lastState) {
      return [states];
    }

    const possibleNextStates = this.stateTransitions?.[lastState]?.filter((nextState) => !states.includes(nextState));
    if (!possibleNextStates || possibleNextStates.length === 0) {
      return [states];
    }

    const sequences: OrderStatus[][] = [];
    for (const nextState of possibleNextStates) {
      sequences.push(...this.determineNextStateInLongestSequence([...states, nextState]));
    }

    sequences.sort((a, b) => b.length - a.length);
    return sequences;
  }
}
