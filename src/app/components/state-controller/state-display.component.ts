import { Component, HostListener, input, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { OrderResponseDTO, OrderStatus } from '../../api';
import { STATE_DESCRIPTIONS, STATE_DISPLAY_NAMES, STATE_FONT_ICONS, STATE_ICONS } from '../../display-name-mappings/status-names';
import { AllowedStateTransitions } from '../../models/allowed-states-transitions';
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

  order = input.required<OrderResponseDTO>();
  allowedStateTransitions: AllowedStateTransitions = {};

  steps: Step[] = [];
  states: OrderStatus[] = [];
  currentStepIndex = 0;

  screenWidth = 0;

  constructor(private readonly stateService: StateWrapperService) { }

  /**
   * Initialize the component by fetching allowed state transitions
   * and setting up the progress bar.
   */
  ngOnInit() {
    this.stateService.getAllowedStateTransitions().subscribe((transitions) => {
      this.allowedStateTransitions = transitions;

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
      label: STATE_ICONS.get(state) + ' ' + STATE_DISPLAY_NAMES.get(state),
      tooltip: STATE_DESCRIPTIONS.get(state) || '',
      icon: STATE_FONT_ICONS.get(state) || '',
    }));
  }

  /**
   * Generate a linear list of states for the progress bar.
   * This simplifies the state progression for display purposes.
   */
  generateLinearStates() {
    this.states = [OrderStatus.IN_PROGRESS];
    let nextState: OrderStatus | undefined;

    do {
      nextState = this.getNextLinearState(this.states);
      if (nextState) {
        this.states.push(nextState);
      }
    } while (nextState);

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
