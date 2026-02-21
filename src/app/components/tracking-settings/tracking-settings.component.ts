import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { delay } from 'rxjs';
import { TrackingService, TrackingSettings } from '../../services/tracking.service';

@Component({
  selector: 'app-tracking-settings',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatDividerModule,
  ],
  templateUrl: './tracking-settings.component.html',
  styleUrl: './tracking-settings.component.scss',
})
export class TrackingSettingsComponent implements OnInit {
  protected readonly trackingEnabled = signal<boolean>(true);
  protected readonly isLoading = signal<boolean>(true);
  protected readonly isSaving = signal<boolean>(false);

  constructor(private readonly trackingService: TrackingService) {}

  ngOnInit(): void {
    this.loadTrackingSettings();
  }

  protected loadTrackingSettings(): void {
    this.isLoading.set(true);
    this.trackingService.getTrackingSettings().subscribe({
      next: (settings: TrackingSettings) => {
        this.trackingEnabled.set(!settings.disableTracking);
        this.isLoading.set(false);
      },
      error: () => {
        console.error('Failed to load tracking settings');
        this.isLoading.set(false);
      },
    });
  }

  protected toggleTracking(): void {
    this.isSaving.set(true);
    const newSettings: TrackingSettings = {
      disableTracking: this.trackingEnabled(),
    };

    this.trackingService
      .setTrackingSettings(newSettings)
      .pipe(
        delay(500) // Delay to let the user see the saving state
      )
      .subscribe({
        next: () => {
          this.trackingEnabled.set(!this.trackingEnabled());
          this.isSaving.set(false);
        },
        error: () => {
          console.error('Failed to toggle tracking');
          this.isSaving.set(false);
        },
      });
  }
}
