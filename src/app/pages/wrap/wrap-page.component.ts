import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { HALF_YEAR_WRAP_GENERATION_MONTH, UserWrap, UserWrapService, WrapPeriod, YEAR_WRAP_GENERATION_MONTH } from '../../services/user-wrap.service';

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
    ],
    templateUrl: './wrap-page.component.html',
    styleUrl: './wrap-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WrapPageComponent implements OnInit {
    private readonly currentPeriod: WrapPeriod = HALF_YEAR_WRAP_GENERATION_MONTH <= new Date().getMonth() && new Date().getMonth() < YEAR_WRAP_GENERATION_MONTH ? 'half-year' : 'year';

    protected readonly periodOptions: { value: WrapPeriod; label: string; sublabel: string }[] = [
        { value: 'half-year', label: 'Letzte 6 Monate', sublabel: 'Frische Aktivitäten' },
    ];

    protected readonly selectedPeriod = signal<WrapPeriod>(this.currentPeriod);
    protected readonly wrap = signal<UserWrap | null>(null);
    protected readonly history = signal<UserWrap[]>([]);
    protected readonly loading = signal<boolean>(false);

    constructor(private readonly wrapService: UserWrapService) {
        if (this.currentPeriod === 'year') this.periodOptions.unshift({ value: 'year', label: 'Letztes Jahr', sublabel: 'Das volle Programm' });
    }

    ngOnInit(): void {
        this.wrapService
            .getHistory()
            .subscribe(history => this.history.set(history));

        this.loadPeriod(this.selectedPeriod());
    }

    protected loadPeriod(period: WrapPeriod) {
        this.selectedPeriod.set(period);
        this.loading.set(true);

        this.wrapService
            .generateWrap(period)
            .subscribe({
                next: wrap => {
                    this.wrap.set(wrap);
                    this.loading.set(false);
                },
                error: () => {
                    console.error("Failed to generate wrap");
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

    protected deltaTrend(delta?: number): 'up' | 'down' | 'flat' {
        if (delta == undefined) return 'flat';
        if (delta > 0.15) return 'up';
        if (delta < -0.15) return 'down';
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
        const generationMonth = month < HALF_YEAR_WRAP_GENERATION_MONTH ? HALF_YEAR_WRAP_GENERATION_MONTH : YEAR_WRAP_GENERATION_MONTH;
        const monthNames = [
            'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
            'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
        ];
        return monthNames[generationMonth];
    }
}
