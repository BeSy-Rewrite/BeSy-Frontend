import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  forkJoin,
  from,
  map,
  Observable,
  of,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { environment } from '../../environments/environment';
import { OrderStatusHistoryResponseDTO } from '../api-services-v2';
import { FilterRequestParams } from '../models/filter/filter-request-params';
import { CachedOrdersService } from './cached-orders.service';
import { OrderSubresourceResolverService } from './order-subresource-resolver.service';
import { OrdersWrapperService } from './wrapper-services/orders-wrapper.service';
import { UsersWrapperService } from './wrapper-services/users-wrapper.service';

export type WrapPeriod = 'year' | 'half-year';

// Configuration: Generation months (0-indexed: 0 = January, 11 = December)
export const YEAR_WRAP_GENERATION_MONTH = environment.wrappedBannerMonths[1]; // December
export const HALF_YEAR_WRAP_GENERATION_MONTH = environment.wrappedBannerMonths[0]; // June

export interface OrderSnapshot {
  id: string;
  label: string;
  itemCount: number;
  totalPrice: number;
  processDurationDays: number;
  placedAt: string;
}

export interface EngagementSample {
  date: string;
  requests: number;
  errors: number;
  timeOnPageMs: number;
}

export interface UserWrapMetrics {
  periodLabel: string;
  rangeStart: string;
  rangeEnd: string;
  orderCount: number;
  itemCount: number;
  totalValue: number;
  averageOrderValue: number;
  averageItemsPerOrder: number;
  processTotalDays: number;
  averageProcessDays: number;
  longestProcessDays: number;
  shortestProcessDays: number;
  priciestOrder?: OrderSnapshot;
  mostItemsOrder?: OrderSnapshot;
  requests: number;
  errors: number;
  timeOnPageMs: number;
  averageRequestTimeMs: number;
  headline: string;
}

export interface WrapComparison {
  orderCountDelta?: number;
  totalValueDelta?: number;
  averageOrderValueDelta?: number;
  averageProcessDelta?: number;
  errorsDelta?: number;
  timeOnPageDelta?: number;
}

export interface UserWrap {
  id: string;
  generatedAt: string;
  period: WrapPeriod;
  metrics: UserWrapMetrics;
  comparison?: WrapComparison;
  previousWrapId?: string;
}

@Injectable({ providedIn: 'root' })
export class UserWrapService {
  private readonly storageKey = 'besy-user-wraps';
  private readonly historySubject = new BehaviorSubject<UserWrap[]>(this.loadHistory());

  private sampleOrders: OrderSnapshot[] | undefined;
  private readonly engagementSamples: EngagementSample[] = this.buildEngagementSamples();

  constructor(
    private readonly ordersService: OrdersWrapperService,
    private readonly cachedOrdersService: CachedOrdersService,
    private readonly subResourceResolver: OrderSubresourceResolverService,
    private readonly userService: UsersWrapperService
  ) {}

  private getOrderSnapshots(): Observable<OrderSnapshot[]> {
    if (this.sampleOrders) return of(this.sampleOrders);

    return this.userService.getCurrentUser().pipe(
      switchMap(user =>
        from(
          this.cachedOrdersService.getAllOrders(0, 1000, ['lastUpdatedTime,desc'], {
            ownerIds: [Number.parseInt(user.id!) ?? 0],
            lastUpdatedTimeAfter: this.getRange('year').start.toISOString(),
          } as FilterRequestParams)
        )
      ),
      map(
        response =>
          response.content?.map(order =>
            forkJoin({
              order: of(order),
              resolvedOrder: from(this.subResourceResolver.resolveOrderSubresources(order)),
              items: from(this.ordersService.getOrderItems(order.id!)),
              history: from(this.ordersService.getOrderStatusHistory(order.id!)),
            })
          ) ?? []
      ),
      switchMap(orderDetailsObservables => {
        return forkJoin(orderDetailsObservables);
      }),
      map(orderDetailsArray =>
        orderDetailsArray.map(
          orderData =>
            ({
              id: orderData.resolvedOrder.besy_number,
              itemCount: orderData.items.map(item => item.quantity ?? 0).reduce((a, b) => a + b, 0),
              totalPrice: orderData.order.quote_price ?? 0,
              processDurationDays: this.calculateProcessDurationDays(orderData.history),
              placedAt: orderData.order.last_updated_time,
              label: orderData.order.content_description ?? 'Keine Bezeichnung',
            }) as OrderSnapshot
        )
      ),
      tap(orders => {
        this.sampleOrders = orders;
      })
    );
  }

  private calculateProcessDurationDays(history: OrderStatusHistoryResponseDTO[]): number {
    history = history.filter(entry => entry.timestamp != undefined);
    history = history.sort(
      (a, b) => new Date(a.timestamp!).getTime() - new Date(b.timestamp!).getTime()
    );
    if (history.length < 2) return 0;
    return Math.round(
      (new Date(history.at(-1)!.timestamp!).getTime() -
        new Date(history.at(0)!.timestamp!).getTime()) /
        (1000 * 60 * 60 * 24)
    ); // days
  }

  getHistory(period?: WrapPeriod): Observable<UserWrap[]> {
    return this.historySubject.asObservable().pipe(
      map(history => {
        const sorted = [...history].sort(
          (a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
        );
        return period ? sorted.filter(wrap => wrap.period === period) : sorted;
      })
    );
  }

  generateWrap(period: WrapPeriod): Observable<UserWrap> {
    const now = new Date();
    const currentMonth = now.getMonth(); // 0-indexed: 0 = January, 11 = December
    const currentYear = now.getFullYear();

    const generationMonth =
      period === 'year' ? YEAR_WRAP_GENERATION_MONTH : HALF_YEAR_WRAP_GENERATION_MONTH;
    const isGenerationMonth = currentMonth === generationMonth;

    // Outside generation month: serve last available wrap (no regeneration)
    if (!isGenerationMonth) {
      const lastAvailableWrap = this.getLastAvailableWrap(period);
      if (lastAvailableWrap) {
        return of(lastAvailableWrap);
      }
      return throwError(
        () =>
          new Error(
            `Keine Wrap-Daten verfügbar. Wraps werden nur im ${this.getGenerationMonthName(period)} generiert.`
          )
      );
    }

    // Generation month: always regenerate (overwrite same year/period entry)
    return forkJoin({
      metrics: this.calculateMetrics(period),
      previous: of(this.getPreviousPeriodWrap(period, currentYear)),
    }).pipe(
      map(({ metrics, previous }) => ({
        id: `wrap-${period}-${currentYear}-${now.getTime()}`,
        generatedAt: now.toISOString(),
        period,
        metrics,
        comparison: previous ? this.buildComparison(metrics, previous.metrics) : undefined,
        previousWrapId: previous?.id,
      })),
      tap(wrap => {
        this.persistWrapForPeriodYear(wrap, currentYear, generationMonth);
      })
    );
  }

  private getLastAvailableWrap(period: WrapPeriod): UserWrap | undefined {
    // Get the most recent wrap for this period type, regardless of year
    const wrapsForPeriod = this.historySubject.value
      .filter(wrap => wrap.period === period)
      .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());

    return wrapsForPeriod[0];
  }

  private getPreviousPeriodWrap(period: WrapPeriod, currentYear: number): UserWrap | undefined {
    // Get the most recent wrap from a previous year/period
    const sorted = [...this.historySubject.value]
      .filter(wrap => wrap.period === period)
      .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());

    // Return the first wrap that's from before the current period
    const targetMonth =
      period === 'year' ? YEAR_WRAP_GENERATION_MONTH : HALF_YEAR_WRAP_GENERATION_MONTH;
    return sorted.find(wrap => {
      const wrapDate = new Date(wrap.generatedAt);
      return (
        wrapDate.getFullYear() < currentYear ||
        (wrapDate.getFullYear() === currentYear && wrapDate.getMonth() < targetMonth)
      );
    });
  }

  private getGenerationMonthName(period: WrapPeriod): string {
    const month = period === 'year' ? YEAR_WRAP_GENERATION_MONTH : HALF_YEAR_WRAP_GENERATION_MONTH;
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
    return monthNames[month];
  }

  private calculateMetrics(period: WrapPeriod): Observable<UserWrapMetrics> {
    const range = this.getRange(period);

    return forkJoin({
      orders: this.getOrderSnapshots(),
      engagement: of(this.engagementSamples),
    }).pipe(
      map(({ orders, engagement }) => {
        const filteredOrders = orders.filter(order =>
          this.isInRange(order.placedAt, range.start, range.end)
        );
        const filteredEngagement = engagement.filter(sample =>
          this.isInRange(sample.date, range.start, range.end)
        );
        return { orders: filteredOrders, engagement: filteredEngagement };
      }),
      map(({ orders, engagement }) => {
        const orderCount = orders.length;
        const itemCount = orders.reduce((sum, order) => sum + order.itemCount, 0);
        const totalValue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
        const totalProcessDays = orders.reduce((sum, order) => sum + order.processDurationDays, 0);
        const requests = engagement.reduce((sum, sample) => sum + sample.requests, 0);
        const errors = engagement.reduce((sum, sample) => sum + sample.errors, 0);
        const timeOnPageMs = engagement.reduce((sum, sample) => sum + sample.timeOnPageMs, 0);

        const priciestOrder = this.pickBy(orders, order => order.totalPrice);
        const mostItemsOrder = this.pickBy(orders, order => order.itemCount);

        return {
          periodLabel: range.label,
          rangeStart: range.start.toISOString(),
          rangeEnd: range.end.toISOString(),
          orderCount,
          itemCount,
          totalValue: this.toFixed(totalValue, 2),
          averageOrderValue: orderCount ? this.toFixed(totalValue / orderCount, 2) : 0,
          averageItemsPerOrder: orderCount ? this.toFixed(itemCount / orderCount, 1) : 0,
          processTotalDays: this.toFixed(totalProcessDays, 1),
          averageProcessDays: orderCount ? this.toFixed(totalProcessDays / orderCount, 1) : 0,
          longestProcessDays: orders.length
            ? this.toFixed(Math.max(...orders.map(order => order.processDurationDays)), 1)
            : 0,
          shortestProcessDays: orders.length
            ? this.toFixed(Math.min(...orders.map(order => order.processDurationDays)), 1)
            : 0,
          priciestOrder: priciestOrder ?? undefined,
          mostItemsOrder: mostItemsOrder ?? undefined,
          requests,
          errors,
          timeOnPageMs,
          averageRequestTimeMs: requests ? this.toFixed(timeOnPageMs / requests, 0) : 0,
          headline: this.buildHeadline(orderCount, totalValue, timeOnPageMs),
        };
      })
    );
  }

  private buildComparison(current: UserWrapMetrics, previous: UserWrapMetrics): WrapComparison {
    return {
      orderCountDelta: this.percentageChange(current.orderCount, previous.orderCount),
      totalValueDelta: this.percentageChange(current.totalValue, previous.totalValue),
      averageOrderValueDelta: this.percentageChange(
        current.averageOrderValue,
        previous.averageOrderValue
      ),
      averageProcessDelta: this.percentageChange(
        current.averageProcessDays,
        previous.averageProcessDays
      ),
      errorsDelta: this.percentageChange(current.errors, previous.errors),
      timeOnPageDelta: this.percentageChange(current.timeOnPageMs, previous.timeOnPageMs),
    };
  }

  private percentageChange(current: number, previous: number): number | undefined {
    if (previous === 0) return undefined;
    return this.toFixed(((current - previous) / previous) * 100, 1);
  }

  private persistWrapForPeriodYear(wrap: UserWrap, targetYear: number, targetMonth: number) {
    const filtered = this.historySubject.value.filter(existing => {
      if (existing.period !== wrap.period) return true;
      const date = new Date(existing.generatedAt);
      return !(date.getFullYear() === targetYear && date.getMonth() === targetMonth);
    });

    const updated = [wrap, ...filtered]
      .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime())
      .slice(0, 8);

    this.historySubject.next(updated);

    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(updated));
    } catch (error) {
      console.warn('Unable to persist wrap history', error);
    }
  }

  private loadHistory(): UserWrap[] {
    if (typeof localStorage === 'undefined') {
      return [];
    }
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as UserWrap[];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.warn('Failed to parse wrap history, starting fresh.', error);
      return [];
    }
  }

  private getRange(period: WrapPeriod) {
    const end = new Date();
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    if (period === 'year') {
      start.setFullYear(start.getFullYear() - 1);
    } else {
      start.setMonth(start.getMonth() - 6);
    }

    return {
      start,
      end,
      label: period === 'year' ? 'Letzte 12 Monate' : 'Letzte 6 Monate',
    };
  }

  private isInRange(date: string, start: Date, end: Date): boolean {
    const value = new Date(date).getTime();
    return value >= start.getTime() && value <= end.getTime();
  }

  private pickBy<T>(entries: T[], selector: (entry: T) => number): T | null {
    if (entries.length === 0) return null;
    return entries.reduce(
      (best, candidate) => {
        if (best === null) return candidate;
        return selector(candidate) > selector(best) ? candidate : best;
      },
      null as T | null
    );
  }

  private toFixed(value: number, decimals: number): number {
    return Number(value.toFixed(decimals));
  }

  private buildHeadline(orderCount: number, totalValue: number, timeOnPageMs: number): string {
    const hours = Math.max(1, Math.round(timeOnPageMs / 3_600_000));
    const spendMood = this.getSpendMood(totalValue);
    const volumeMood = this.getVolumeMood(orderCount);
    return `${spendMood} • ${volumeMood} • ${hours}h im Tool`;
  }

  private getSpendMood(totalValue: number): string {
    if (totalValue > 8_500) {
      return 'High Roller';
    }
    if (totalValue > 4_000) {
      return 'Smooth Buyer';
    }
    return 'Selective Curator';
  }

  private getVolumeMood(orderCount: number): string {
    if (orderCount > 24) {
      return 'Sprint Season';
    }
    if (orderCount > 12) {
      return 'Balanced Flow';
    }
    return 'Quiet but precise';
  }

  private buildEngagementSamples(): EngagementSample[] {
    return [
      { date: this.toIsoDaysAgo(14), requests: 62, errors: 1, timeOnPageMs: 390_000 },
      { date: this.toIsoDaysAgo(41), requests: 58, errors: 2, timeOnPageMs: 360_000 },
      { date: this.toIsoDaysAgo(69), requests: 71, errors: 1, timeOnPageMs: 420_000 },
      { date: this.toIsoDaysAgo(96), requests: 49, errors: 0, timeOnPageMs: 310_000 },
      { date: this.toIsoDaysAgo(128), requests: 65, errors: 3, timeOnPageMs: 445_000 },
      { date: this.toIsoDaysAgo(152), requests: 54, errors: 2, timeOnPageMs: 330_000 },
      { date: this.toIsoDaysAgo(189), requests: 69, errors: 1, timeOnPageMs: 380_000 },
      { date: this.toIsoDaysAgo(215), requests: 51, errors: 2, timeOnPageMs: 295_000 },
      { date: this.toIsoDaysAgo(248), requests: 57, errors: 1, timeOnPageMs: 318_000 },
      { date: this.toIsoDaysAgo(276), requests: 60, errors: 2, timeOnPageMs: 352_000 },
      { date: this.toIsoDaysAgo(309), requests: 48, errors: 0, timeOnPageMs: 280_000 },
      { date: this.toIsoDaysAgo(341), requests: 52, errors: 1, timeOnPageMs: 300_000 },
      { date: this.toIsoDaysAgo(390), requests: 46, errors: 0, timeOnPageMs: 265_000 },
      { date: this.toIsoDaysAgo(430), requests: 50, errors: 1, timeOnPageMs: 275_000 },
    ];
  }

  private toIsoDaysAgo(daysAgo: number): string {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString();
  }
}
