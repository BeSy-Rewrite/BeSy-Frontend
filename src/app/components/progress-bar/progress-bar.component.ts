import { Component, Input, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from "@angular/material/tooltip";

export interface Step {
  label: string;     // "Step 1", "Step 2" etc. (kannst du später ersetzen)
  tooltip: string;   // Hilfetext beim Hover
  icon?: string;     // Optional: Icon-Namen, falls du statt Zahlen Icons willst
}

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.css'],
  imports: [MatIconModule, MatTooltipModule, CommonModule]
})
export class ProgressBarComponent {
  @Input() steps: Step[] = [];
  @Input() currentStepIndex = 0; // welcher Step ist aktuell
}
