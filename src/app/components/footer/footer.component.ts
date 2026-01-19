import { Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { environment } from '../../../environments/environment';
import { build } from '../../../environments/version';
import { TrackingService, TrackingSettings } from '../../services/tracking.service';
import { UtilsService } from '../../services/utils.service';

@Component({
  selector: 'app-footer',
  imports: [MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  build = build;
  apiVersion: string | undefined = undefined;
  bugReportUrl = environment.bugReportUrl;
  links = environment.footerLinks;

  protected readonly trackingEnabled = signal<boolean>(true);
  protected readonly togglingTracking = signal<boolean>(false);

  constructor(
    private readonly utilsService: UtilsService,
    private readonly trackingService: TrackingService
  ) {
    this.trackingService.getTrackingSettings().subscribe((settings: TrackingSettings) => {
      this.trackingEnabled.set(!settings.disableTracking);
    });
  }

  addConfetti() {
    this.utilsService.getConfettiInstance().addConfetti();
  }

  protected toggleTracking(): void {
    this.togglingTracking.set(true);
    const newSettings: TrackingSettings = {
      disableTracking: this.trackingEnabled(),
    };

    this.trackingService.setTrackingSettings(newSettings).subscribe({
      next: () => {
        this.trackingEnabled.set(!this.trackingEnabled());
        this.togglingTracking.set(false);
      },
      error: () => {
        console.error('Failed to toggle tracking');
        this.togglingTracking.set(false);
      },
    });
  }
}
