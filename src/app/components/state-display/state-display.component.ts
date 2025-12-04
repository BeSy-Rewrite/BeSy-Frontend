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

    this.stateService.getLongestSequenceOfStates().subscribe(sequence => {
      this.skippableStates = this.stateService.getSkippableStates();
      this.futureStates = this.truncateStatesAfterCurrent(sequence);
      this.checkHistory();
      this.generateSteps();
    });
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
   * Truncate the future states after the current order status.
   */
  truncateStatesAfterCurrent(futureStates: OrderStatus[]): OrderStatus[] {
    if (this.order().status === OrderStatus.DELETED) return [];

    const futureCutOffIndex = futureStates.indexOf(this.order().status!);
    return futureStates.slice(futureCutOffIndex + 1);
  }

  /**
   * Check the order status history for missing states and repair it if necessary.
   */
  checkHistory() {
    const requiredPastStates = this.skippableStates.slice(0, this.skippableStates.indexOf(this.order().status!) + 1);
    const repairedHistory = [...this.orderStatusHistory];
    for (const state of requiredPastStates) {
      if (!this.orderStatusHistory.some(entry => entry.status === state)) {
        const newHistoryEntry: OrderStatusHistoryResponseDTO = { status: state, timestamp: "Unknown" };
        const insertIndex = repairedHistory.slice().reverse().findIndex(entry =>
          this.allowedStateTransitions[entry.status!]?.includes(state)
        );

        if (insertIndex === -1) {
          repairedHistory.push(newHistoryEntry);
        } else {
          repairedHistory.splice(insertIndex, 0, newHistoryEntry);
        }
      }
    }

  }
}
