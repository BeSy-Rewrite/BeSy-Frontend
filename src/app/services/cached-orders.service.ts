import { Injectable } from '@angular/core';
import { from, of, tap } from 'rxjs';
import { OrdersService, PagedOrderResponseDTO } from '../api';
import { FilterRequestParams } from '../models/filter-request-params';
import { environment } from '../../environments/environment';

type CacheEntry = {
  response: PagedOrderResponseDTO;
  createdAt: Date;
};

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

  private totalElements: number = 0;
  private readonly cacheDurationMs: number = environment.cacheDurationMs || 5 * 60 * 1000; // 5 minutes default

  private readonly cache: Map<string, CacheEntry> = new Map();

  /**
   * Fetch orders from the API and cache the result.
   * If the requested data is in the cache and still valid, it returns the cached response.
   * @param page Number of the page to fetch (0-indexed)
   * @param size Number of items per page
   * @param sort Sorting criteria in the format: property(,asc|desc). Default sort order is ascending. Multiple sort criteria are supported.
   * @param filters Filter parameters to apply
   * @param searchTerm Search term to filter results
   * @returns An observable of the paged order response
   */
  getAllOrders(
    page: number = 0,
    size: number = 20,
    sort: Array<string> = [],
    filters: FilterRequestParams = {} as FilterRequestParams,
    searchTerm: string = ''
  ) {
    this.cleanCache();

    const cacheKey = this.getCacheKey(page, size, sort, filters, searchTerm);
    if (this.cache.has(cacheKey)) {
      return of(this.cache.get(cacheKey)!.response);
    }

    return this.fetchOrders(page, size, sort, filters, searchTerm);
  }

  /**
   * Clear the cache and reset total elements count.
   */
  clearCache() {
    this.cache.clear();
    this.totalElements = 0;
  }

  /**
   * Fetch orders from the API.
   * This method handles the API call and caches the response.
   * @param page Number of the page to fetch (0-indexed)
   * @param size Number of items per page
   * @param sort Sorting criteria in the format: property(,asc|desc). Default sort order is ascending. Multiple sort criteria are supported.
   * @param filters Filter parameters to apply
   * @param searchTerm Search term to filter results
   * @returns An observable of the paged order response
   */
  private fetchOrders(
    page: number,
    size: number,
    sort: Array<string>,
    filters: FilterRequestParams,
    searchTerm: string = ''
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

        this.cache.set(this.getCacheKey(page, size, sort, filters, searchTerm),
          { response: pageResponse, createdAt: new Date() }
        );
      })
    );
  }

  /** 
   * Check if the cache is still valid based on its age.
   * This method removes stale cache entries based on the defined cache duration.
   */
  private cleanCache(): void {
    this.cache.forEach((entry, key) => {
      const cacheAge = new Date().getTime() - entry.createdAt.getTime();
      if (cacheAge > this.cacheDurationMs) {
        this.cache.delete(key);
      }
    });
  }

  /** 
   * Generate a cache key based on page, size, sort parameters, filters, and search term.
   * @param page Page number
   * @param size Page size
   * @param sort Sort parameters
   * @param filters Filter parameters
   * @param searchTerm Search term to filter results
   * @returns A unique cache key
   */
  private getCacheKey(page: number, size: number, sort: Array<string>, filters: FilterRequestParams, searchTerm: string): string {
    const sortKey = sort ? sort.join(',') : '';
    const filtersKey = JSON.stringify(filters);
    return `${page}-${size}-${sortKey}-${filtersKey}-${searchTerm}`;
  }

}
