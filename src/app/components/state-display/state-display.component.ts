import { Component, input, OnChanges, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { forkJoin } from 'rxjs';
import { OrderResponseDTO, OrderStatus, OrderStatusHistoryResponseDTO } from '../../api-services-v2';
import { STATE_DESCRIPTIONS, STATE_DISPLAY_NAMES, STATE_FONT_ICONS, STATE_ICONS } from '../../display-name-mappings/status-names';
import { AllowedStateTransitions } from '../../models/allowed-states-transitions';
import { OrdersWrapperService } from '../../services/wrapper-services/orders-wrapper.service';
import { StateWrapperService } from '../../services/wrapper-services/state-wrapper.service';
import { ProgressBarComponent, Step } from "../progress-bar/progress-bar.component";

@Component({
  selector: 'app-state-display',
  imports: [
    ProgressBarComponent,
    MatButtonModule
  ],
  templateUrl: './state-display.component.html',
  styleUrl: './state-display.component.scss'
})
export class StateDisplayComponent implements OnInit, OnChanges {

  /**
   * The order for which the state display is shown.
   */
  order = input.required<OrderResponseDTO>();

  allowedStateTransitions: AllowedStateTransitions = {};
  orderStatusHistory: OrderStatusHistoryResponseDTO[] = [];

  steps: Step[] = [];
  currentStepIndex = 0;

  futureStates: OrderStatus[] = [];
  skippableStates: OrderStatus[] = [];

  isInitialized = false;

  constructor(
    private readonly stateService: StateWrapperService,
    private readonly ordersService: OrdersWrapperService
  ) { }

  /**
   * Initialize the component by fetching allowed state transitions
   * and setting up the progress bar.
   */
  ngOnInit() {
    forkJoin({
      transitions: this.stateService.getAllowedStateTransitions(),
      history: this.ordersService.getOrderStatusHistory(this.order().id!)
    })
      .subscribe(({ transitions, history }) => {
        this.allowedStateTransitions = transitions;
        this.setupProgressData(history);
        this.isInitialized = true;
      });
  }

  /**
   * Update the progress bar when the order input changes.
   */
  ngOnChanges() {
    if (this.isInitialized) {
      this.ordersService.getOrderStatusHistory(this.order().id!).then(history => {
        this.setupProgressData(history);
      });
    }
  }

  /**
   * Setup the progress bar data based on order status history.
   * @param history The order status history.
   */
  setupProgressData(history: OrderStatusHistoryResponseDTO[]) {
    this.orderStatusHistory = [...history].sort((a, b) => Date.parse(a.timestamp ?? '') - Date.parse(b.timestamp ?? ''));

    const sequences = this.determineNextStateInLongestSequence([OrderStatus.IN_PROGRESS]);
    this.setupSkippableStates(sequences);
    this.futureStates = sequences[0];
    this.generateLinearStates();
    this.generateSteps();
  }

  /**
   * Generate the steps for the progress bar based on the current states.
   */
  generateSteps() {
    this.steps = [];
    for (const historyEntry of this.orderStatusHistory) {
      if (historyEntry.status === undefined) continue;
      this.steps.push(this.generateStepFromState(historyEntry.status, historyEntry.timestamp));
    }
    this.currentStepIndex = this.steps.length - 1;
    for (const futureState of this.futureStates) {
      this.steps.push(this.generateStepFromState(futureState));
    }
  }

  /**
   * Generate a Step object from an order state.
   * @param state The order status.
   * @param timestamp Optional timestamp for the state.
   * @returns The generated Step object.
   */
  generateStepFromState(state: OrderStatus, timestamp?: string): Step {
    return {
      label: STATE_ICONS.get(state) + '\u00A0' + STATE_DISPLAY_NAMES.get(state),
      subLabel: timestamp ? new Date(timestamp).toLocaleDateString() : undefined,
      tooltip: STATE_DESCRIPTIONS.get(state) || '',
      icon: STATE_FONT_ICONS.get(state) || '',
      isSkippable: this.skippableStates.includes(state)
    };
  }

  /**
   * Generate a linear sequence of future states based on allowed transitions.
   */
  generateLinearStates() {
    if (this.order().status === OrderStatus.DELETED) return;

    this.futureStates = this.futureStates.slice(this.futureStates.indexOf(this.order().status!) + 1);
  }

  /**
   * Recursively determine the next state in the longest valid sequence.
   * @param states Current sequence of states.
   * @returns The longest sequence of states including the next valid state.
   */
  private determineNextStateInLongestSequence(states: OrderStatus[]): OrderStatus[][] {
    const lastState = states.at(-1);
    if (!lastState) {
      return [states];
    }

    const possibleNextStates = this.allowedStateTransitions[lastState]?.filter((nextState) => !states.includes(nextState));
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
}
