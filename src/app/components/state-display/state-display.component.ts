import { Component, input, OnChanges, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { forkJoin } from 'rxjs';
import { OrderResponseDTO, OrderStatus, OrderStatusHistoryResponseDTO } from '../../api';
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
  states: OrderStatus[] = [];
  currentStepIndex = 0;

  screenWidth = 0;

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
        this.orderStatusHistory = [...history].sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp));

        this.generateLinearStates();
        this.generateSteps();
      });
  }

  ngOnChanges() {
    this.ordersService.getOrderStatusHistory(this.order().id!).then(history => {
      this.orderStatusHistory = [...history].sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp));
      this.generateLinearStates();
      this.generateSteps();
    });
  }

  /**
   * Generate the steps for the progress bar based on the current states.
   */
  generateSteps() {
    this.steps = [];
    let i = 0;
    for (const state of this.states) {
      const timestamp = this.orderStatusHistory.at(i)?.timestamp ?? '';

      this.steps.push({
        label: STATE_ICONS.get(state) + '\u00A0' + STATE_DISPLAY_NAMES.get(state),
        subLabel: timestamp ? new Date(timestamp).toLocaleDateString() : undefined,
        tooltip: STATE_DESCRIPTIONS.get(state) || '',
        icon: STATE_FONT_ICONS.get(state) || '',
      });
      i++;
    }
  }

  /**
   * Generate a linear sequence of states for the progress bar.
   * Ensures all future states are included in order.
   */
  generateLinearStates() {
    this.setupStateHistory();

    const futureStates = [OrderStatus.IN_PROGRESS];
    let nextState: OrderStatus | undefined;

    do {
      nextState = this.getNextLinearState(futureStates);
      if (nextState) {
        futureStates.push(nextState);
      }
    } while (nextState);

    if (this.order().status === OrderStatus.DELETED) return;

    this.states = [...this.states, ...futureStates.splice(futureStates.indexOf(this.order().status!) + 1)];
    this.currentStepIndex = this.states.lastIndexOf(this.order().status!);
  }

  /**
   * Setup the initial state history for the progress bar.
   */
  private setupStateHistory() {
    this.states = this.orderStatusHistory.map(h => h.status).slice();
    if (this.states.at(-1) !== this.order().status) {
      this.states.push(this.order().status!);
    }
    this.currentStepIndex = this.states.lastIndexOf(this.order().status!);
  }


  /**
   * Get the next linear state in the progression.
   * Maps non-linear transitions to the next logical step.
   * @param states The current list of states.
   * @returns The next linear state or undefined if there is none.
   */
  private getNextLinearState(states: OrderStatus[]): OrderStatus | undefined {
    const lastState = states.at(-1);
    if (!lastState) {
      return undefined;
    }
    return this.allowedStateTransitions[lastState]?.find((nextState) =>
      nextState !== OrderStatus.DELETED && nextState !== OrderStatus.IN_PROGRESS
    );
  }
}
