import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface Step {
  label: string;
  subLabel?: string;
  tooltip: string;
  icon?: string;
  isSkippable?: boolean;
}

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.scss'],
  imports: [MatIconModule, MatTooltipModule, CommonModule],
})
export class ProgressBarComponent {
  /**
   * Steps to be displayed in the progress bar.
   */
  steps = input<Step[]>([]);
  /**
   * Index of the current active step.
   */
  currentStepIndex = input<number>(0);

  /**
   * Check if the step at index i is completed.
   * @param i Index of the step.
   * @returns True if the step is completed, false otherwise.
   */
  isCompleted(i: number) {
    return i <= this.currentStepIndex();
  }

  /**
   * Check if the step at index i is the active step.
   * @param i Index of the step.
   * @returns True if the step is active, false otherwise.
   */
  isActive(i: number) {
    return i === this.currentStepIndex();
  }

  /**
   * Get the color class for a step based on its index.
   * @param i Index of the step.
   * @returns The corresponding color class.
   */
  getColorClass(i: number): string {
    if (this.steps().at(i - 1)?.isSkippable) {
      return this.getColorClass(i - 1);
    }
    if (this.isActive(i - 1)) {
      return 'bg-blue-600';
    }
    if (this.isCompleted(i)) {
      return 'bg-green-600';
    }
    return 'bg-gray-500';
  }
}
