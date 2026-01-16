import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from "@angular/material/tooltip";
import { RouterLink } from '@angular/router';
import { TrackingService, TrackingSettings } from '../../services/tracking.service';
import {
  HALF_YEAR_WRAP_GENERATION_MONTH,
  UserWrap,
  UserWrapService,
  WrapPeriod,
  YEAR_WRAP_GENERATION_MONTH,
} from '../../services/user-wrap.service';

@Component({
  selector: 'app-wrap-page',
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatIconModule,
    MatProgressBarModule,
    RouterLink,
    MatTooltipModule
  ],
  templateUrl: './wrap-page.component.html',
  styleUrl: './wrap-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WrapPageComponent implements OnInit {
  private readonly currentPeriod: WrapPeriod =
    HALF_YEAR_WRAP_GENERATION_MONTH <= new Date().getMonth() &&
      new Date().getMonth() < YEAR_WRAP_GENERATION_MONTH
      ? 'half-year'
      : 'year';

  protected readonly periodOptions: { value: WrapPeriod; label: string; sublabel: string }[] = [
    { value: 'half-year', label: 'Letzte 6 Monate', sublabel: 'Frische Aktivitäten' },
  ];

  protected readonly selectedPeriod = signal<WrapPeriod>(this.currentPeriod);
  protected readonly wrap = signal<UserWrap | null>(null);
  protected readonly history = signal<UserWrap[]>([]);
  protected readonly loading = signal<boolean>(false);
  protected readonly trackingEnabled = signal<boolean>(true);
  protected readonly togglingTracking = signal<boolean>(false);

  constructor(
    private readonly wrapService: UserWrapService,
    private readonly trackingService: TrackingService
  ) {
    if (this.currentPeriod === 'year')
      this.periodOptions.unshift({
        value: 'year',
        label: 'Letztes Jahr',
        sublabel: 'Das volle Programm',
      });
  }

  ngOnInit(): void {
    this.wrapService.getHistory().subscribe(history => this.history.set(history));

    this.trackingService.getTrackingSettings().subscribe({
      next: settings => {
        this.trackingEnabled.set(!settings.disableTracking);
      },
      error: () => {
        console.error('Failed to load tracking settings');
      },
    });

    this.loadPeriod(this.selectedPeriod());
  }

  protected loadPeriod(period: WrapPeriod) {
    this.selectedPeriod.set(period);
    this.loading.set(true);

    this.wrapService.generateWrap(period).subscribe({
      next: wrap => {
        this.wrap.set(wrap);
        this.loading.set(false);
      },
      error: () => {
        console.error('Failed to generate wrap');
        this.wrap.set(null);
        this.loading.set(false);
      },
    });
  }

  protected formatDelta(delta?: number): string {
    if (delta == undefined) return '—';
    const prefix = delta > 0 ? '+' : '';
    return `${prefix}${delta.toFixed(1)}%`;
  }

  // Determine trend direction based on delta value (in percentage)
  protected deltaTrend(delta?: number): 'up' | 'down' | 'flat' {
    if (delta == undefined) return 'flat';
    if (delta > 0.4) return 'up';
    if (delta < -0.4) return 'down';
    return 'flat';
  }

  protected msToHours(ms: number): number {
    return Math.round((ms / 3_600_000) * 10) / 10;
  }

  protected msToMinutes(ms: number): number {
    return Math.round(ms / 60_000);
  }

  protected getNextGenerationMonthName(): string {
    const month = new Date().getMonth();
    const generationMonth =
      month < HALF_YEAR_WRAP_GENERATION_MONTH
        ? HALF_YEAR_WRAP_GENERATION_MONTH
        : YEAR_WRAP_GENERATION_MONTH;
    const monthNames = [
      'Januar',
      'Februar',
      'März',
      'April',
      'Mai',
      'Juni',
      'Juli',
      'August',
      'September',
      'Oktober',
      'November',
      'Dezember',
    ];
    return monthNames[generationMonth];
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
