import { Component, HostListener, input, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { forkJoin } from 'rxjs';
import { OrderResponseDTO, OrderStatus } from '../../api';
import { STATE_DESCRIPTIONS, STATE_DISPLAY_NAMES, STATE_FONT_ICONS, STATE_ICONS } from '../../display-name-mappings/status-names';
import { AllowedStateTransitions } from '../../models/allowed-states-transitions';
import { OrdersWrapperService } from '../../services/wrapper-services/orders-wrapper.service';
import { StateWrapperService } from '../../services/wrapper-services/state-wrapper.service';
import { ProgressBarComponent, Step } from "../progress-bar/progress-bar.component";

@Component({
  selector: 'app-state-controller',
  imports: [
    ProgressBarComponent,
    MatButtonModule
  ],
  templateUrl: './state-display.component.html',
  styleUrl: './state-display.component.scss'
})
export class StateDisplayComponent implements OnInit {

  /**
   * The order for which the state display is shown.
   */
  order = input.required<OrderResponseDTO>();

  allowedStateTransitions: AllowedStateTransitions = {};
  orderStatusHistory: OrderStatus[] = [];

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
        const sorted = [...history].sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp));
        this.orderStatusHistory = sorted.map(h => h.status);

        this.generateLinearStates();
        this.generateSteps();
        this.onResize();
      });
  }

  /**
   * Handle window resize events to adjust the progress bar steps.
   * Hides steps centered around the current step if the screen is too small.
   * @param event The resize event.
   */
  @HostListener('window:resize', ['$event'])
  onResize(event: any = null) {
    this.screenWidth = window.innerWidth;

    this.generateLinearStates();

    while (this.states.length * 1450 / 7 > this.screenWidth && this.states.length > 2) {

      if (this.currentStepIndex < (this.states.length - 1) / 2) {
        this.states.pop();
      } else {
        this.states.shift();
      }

      this.currentStepIndex = this.states.indexOf(this.order().status!);
    }

    this.generateSteps();
  }

  /**
   * Generate the steps for the progress bar based on the current states.
   */
  generateSteps() {
    this.steps = this.states.map((state) => ({
      label: STATE_ICONS.get(state) + '\u00A0' + STATE_DISPLAY_NAMES.get(state),
      tooltip: STATE_DESCRIPTIONS.get(state) || '',
      icon: STATE_FONT_ICONS.get(state) || '',
    }));
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
    this.currentStepIndex = this.states.indexOf(this.order().status!);
  }

  /**
   * Setup the initial state history for the progress bar.
   */
  private setupStateHistory() {
    this.states = this.orderStatusHistory.slice();
    if (!this.states.includes(this.order().status!)) {
      this.states.push(this.order().status!);
    }
    this.currentStepIndex = this.states.indexOf(this.order().status!);
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
