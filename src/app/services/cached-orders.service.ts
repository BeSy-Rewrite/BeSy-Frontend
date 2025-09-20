import { Injectable } from '@angular/core';
import { from, of, tap } from 'rxjs';
import { OrdersService, PagedOrderResponseDTO } from '../api';
import { FilterRequestParams } from '../models/filter-request-params';

@Injectable({
  providedIn: 'root'
})
/**
 * Service to fetch and cache orders with filtering support.
 * The cache is invalidated when filters change or after a set duration.
 * This improves performance by reducing redundant API calls.
 * The cache duration is configurable (default: 5 minutes).
 */
export class CachedOrdersService {

  private currentFilters: FilterRequestParams | undefined;
  private totalElements: number = 0;
  private cacheCreatedAt: Date = new Date();
  private readonly cacheDurationMs: number = 5 * 60 * 1000; // 5 Minuten

  private readonly cache: Map<string, PagedOrderResponseDTO> = new Map();

  /**
   * Fetch orders from the API and cache the result.
   * @param page Number of the page to fetch (0-indexed)
   * @param size Number of items per page
   * @param sort Sorting criteria in the format: property(,asc|desc). Default sort order is ascending. Multiple sort criteria are supported.
   * @param filters Filter parameters to apply
   * @returns An observable of the paged order response
   */
  getAllOrders(
    page: number = 0,
    size: number = 20,
    sort: Array<string> = [],
    filters: FilterRequestParams = {} as FilterRequestParams
  ) {
    if (JSON.stringify(this.currentFilters) !== JSON.stringify(filters)) {
      this.currentFilters = filters;
      this.cache.clear();

      return this.fetchOrders(page, size, sort, filters);
    }

    const cacheKey = this.getCacheKey(page, size, sort);
    if (this.cache.has(cacheKey)) {
      return of(this.cache.get(cacheKey)!);
    }

    return this.fetchOrders(page, size, sort, filters);
  }

  /**
   * Clear the cache.
   */
  clearCache() {
    this.cache.clear();
    this.totalElements = 0;
  }

  /**
   * Fetch orders from the API.
   * @param page Number of the page to fetch (0-indexed)
   * @param size Number of items per page
   * @param sort Sorting criteria in the format: property(,asc|desc). Default sort order is ascending. Multiple sort criteria are supported.
   * @param filters Filter parameters to apply
   * @returns An observable of the paged order response
   */
  private fetchOrders(
    page: number,
    size: number,
    sort: Array<string>,
    filters: FilterRequestParams
  ) {
    return from(OrdersService.getAllOrders(
      page,
      size,
      sort,
      filters?.primaryCostCenters,
      filters?.bookingYears,
      filters?.createdAfter,
      filters?.createdBefore,
      filters?.ownerIds,
      filters?.statuses,
      filters?.quotePriceMin,
      filters?.quotePriceMax,
      filters?.deliveryPersonIds,
      filters?.invoicePersonIds,
      filters?.queriesPersonIds,
      filters?.customerIds,
      filters?.supplierIds,
      filters?.secondaryCostCenters,
      filters?.lastUpdatedTimeAfter,
      filters?.lastUpdatedTimeBefore
    )).pipe(
      tap((pageResponse: PagedOrderResponseDTO) => {

        if (pageResponse.total_elements !== undefined &&
          this.totalElements !== pageResponse.total_elements) {
          this.cache.clear();
          this.totalElements = pageResponse.total_elements;
        }
        if (!this.isCacheValid()) {
          this.cache.clear();
          this.cacheCreatedAt = new Date();
        }

        this.cache.set(this.getCacheKey(page, size, sort), pageResponse);
      })
    );
  }

  /** Check if the cache is still valid based on its age.
   * @return True if the cache is valid, false otherwise.
   */
  private isCacheValid(): boolean {
    const cacheAge = new Date().getTime() - this.cacheCreatedAt.getTime();
    return cacheAge < this.cacheDurationMs;
  }

  /** Generate a cache key based on page, size, and sort parameters.
   * @param page Page number
   * @param size Page size
   * @param sort Sort parameters
   * @returns A unique cache key
   */
  private getCacheKey(page: number, size: number, sort: Array<string>): string {
    const sortKey = sort ? sort.join(',') : '';
    return `${page}-${size}-${sortKey}`;
  }

}
