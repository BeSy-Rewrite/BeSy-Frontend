import { CollectionViewer } from '@angular/cdk/collections';
import { DataSource } from '@angular/cdk/table';
import { Injectable } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { BehaviorSubject, debounceTime, Observable } from 'rxjs';
import { OrderResponseDTO, OrderStatus, PagedOrderResponseDTO } from '../api';
import { ActiveFilters } from '../models/filter-menu-types';
import { FilterRequestParams } from '../models/filter-request-params';
import { CachedOrdersService } from './cached-orders.service';


class PageCache {
  content: Map<number, OrderResponseDTO[]> = new Map();
  totalElements: number = 0;
  pageSize: number = 0;
  filter: Map<string, any> | undefined;
  searchTerm: string | undefined;
  sorting: string[] = [];

  clear() {
    this.content.clear();
    this.totalElements = 0;
    this.pageSize = 0;
    this.filter = undefined;
    this.searchTerm = undefined;
  }
  isEmpty() {
    return this.content.size === 0;
  }
}

@Injectable({
  providedIn: 'root'
})
export class OrdersDataSourceService<T> extends DataSource<T> {
  private static readonly DEFAULT_PAGE_SIZE = 25;

  private readonly _data: BehaviorSubject<any[]>;
  private _paginator: MatPaginator | undefined;
  private _sort: MatSort | undefined;
  private _filter: ActiveFilters | undefined;
  private readonly _filterUpdates: BehaviorSubject<ActiveFilters> | undefined;
  private _searchTerm: string | undefined;

  private readonly _sorting: string[] = [];

  constructor(private readonly cacheService: CachedOrdersService) {
    super();
    this._data = new BehaviorSubject<OrderResponseDTO[]>([]);

    this._filterUpdates = new BehaviorSubject<ActiveFilters>({} as ActiveFilters);
    this._filterUpdates.pipe(debounceTime(100))
      .subscribe(filter => {
        this._filter = filter;
        this._fetchData();
      });
  }

  /**
   * The data to be displayed by the table.
   * This is a required property and must be set for the table to function.
   * @returns The current data array.
   */
  get data(): OrderResponseDTO[] {
    return this._data.value;
  }
  /**
   * Sets the data to be displayed by the table.
   * Triggers an update to the table display.
   * @param data The new data array.
   */
  set data(data: OrderResponseDTO[]) {
    data = Array.isArray(data) ? data : [];
    this._data.next(data);
  }

  /**
   * The paginator used to control the pagination of the table.
   * This is an optional property but is required for pagination to function.
   * If not provided, the table will not paginate.
   * @returns The current MatPaginator instance.
   */
  get paginator(): MatPaginator | undefined {
    return this._paginator;
  }
  /**
   * Sets the paginator used to control the pagination of the table.
   * Triggers an update to the table display when the paginator changes.
   * @param paginator The new MatPaginator instance.
   */
  set paginator(paginator: MatPaginator) {
    this._paginator = paginator;
    this._paginator.page.subscribe((page: PageEvent) => {
      this._fetchData();
    });
  }

  /**
   * The sort used to control the sorting of the table.
   * This is an optional property but is required for sorting to function.
   * If not provided, the table will not sort.
   * @returns The current MatSort instance.
   */
  get sort(): MatSort | undefined {
    return this._sort;
  }
  /**
   * Sets the sort used to control the sorting of the table.
   * Triggers an update to the table display when the sort changes.
   * @param sort The new MatSort instance.
   */
  set sort(sort: MatSort) {
    this._sort = sort;
    this._sort.sortChange.subscribe((sort: Sort) => {
      sort.active = this.snakeToCamel(sort.active);

      if (sort.direction === '') {
        this._sorting.length = 0;
      } else {
        const sortIndex = this._sorting.findIndex(s => s.startsWith(sort.active + ','));
        if (sortIndex !== -1) {
          this._sorting.splice(sortIndex, 1);
        }

        this._sorting.unshift(sort.active + ',' + sort.direction);
      }

      this._fetchData();
    });
  }

  /**
   * The active filters applied to the table data.
   * This is an optional property but is required for filtering to function.
   * If not provided, the table will not filter.
   * @returns The current ActiveFilters instance.
   */
  get filter(): ActiveFilters | undefined {
    return this._filter;
  }
  /**
   * Sets the active filters applied to the table data.
   * Triggers an update to the table display when the filters change.
   * @param filter The new ActiveFilters instance.
   */
  set filter(filter: ActiveFilters) {
    this._filter = filter;
    this._filterUpdates?.next(filter);
  }

  /**
   * The search term used to filter the table data.
   * This is an optional property but is required for searching to function.
   * If not provided, the table will not filter by search term.
   * @returns The current search term.
   */
  get searchTerm(): string | undefined {
    return this._searchTerm;
  }
  /**
   * Sets the search term used to filter the table data.
   * Triggers an update to the table display when the search term changes.
   * @param searchTerm The new search term.
   */
  set searchTerm(searchTerm: string) {
    this._searchTerm = searchTerm;
    // Handle search term change if necessary
    this._fetchData();
  }

  /**
   * Constructs the filter request parameters from the current active filters.
   * This is used to send the correct filter parameters to the backend API.
   * @returns The constructed FilterRequestParams object.
   */
  getFilterRequestParams(): FilterRequestParams {
    return {
      primaryCostCenters: this._filter?.primary_cost_center_id?.map(f => f.id?.toString() ?? ''),
      bookingYears: this._filter?.booking_year?.map(f => f.id?.toString() ?? ''),
      createdBefore: this._filter?.created_date.start?.toISOString(),
      createdAfter: this._filter?.created_date.end?.toISOString(),
      ownerIds: this._filter?.owner_id?.map(f => f.id).filter(f => f !== undefined) as number[] | undefined,
      statuses: this._filter?.status?.map(f => f.id).filter(f => f !== undefined) as OrderStatus[] | undefined,
      quotePriceMin: this._filter?.quote_price?.start,
      quotePriceMax: this._filter?.quote_price?.end,
      deliveryPersonIds: this._filter?.delivery_person_id?.map(f => f.id).filter(f => f !== undefined) as number[] | undefined,
      invoicePersonIds: this._filter?.invoice_person_id?.map(f => f.id).filter(f => f !== undefined) as number[] | undefined,
      queriesPersonIds: this._filter?.queries_person_id?.map(f => f.id).filter(f => f !== undefined) as number[] | undefined,
      customerIds: undefined,
      supplierIds: this._filter?.supplier_id?.map(f => f.id).filter(f => f !== undefined) as number[] | undefined,
      secondaryCostCenters: this._filter?.secondary_cost_center_id?.map(f => f.id?.toString() ?? ''),
      lastUpdatedTimeAfter: this._filter?.last_updated_time.start?.toISOString(),
      lastUpdatedTimeBefore: this._filter?.last_updated_time.end?.toISOString(),
    }
  }

  /**
   * Converts a snake_case string to camelCase.
   * @param s The snake_case string to convert.
   * @returns The converted camelCase string.
   */
  private snakeToCamel(s: string): string {
    return s.replace(/(_\w)/g, m => m[1].toUpperCase());
  }

  /**
   * Fetches data from the backend API using the current paginator, sort, filter, and search term.
   * Updates the data and paginator properties with the fetched data.
   */
  private _fetchData() {
    this.cacheService.getAllOrders(
      this._paginator?.pageIndex ?? 0,
      this._paginator?.pageSize ?? OrdersDataSourceService.DEFAULT_PAGE_SIZE,
      this._sorting,
      this.getFilterRequestParams()
    ).subscribe((page: PagedOrderResponseDTO) => {
      this.data = page.content ?? [];

      if (this._paginator) {
        this._paginator.pageIndex = page.number ?? 0;
        this._paginator.pageSize = page.size ?? OrdersDataSourceService.DEFAULT_PAGE_SIZE;
        this._paginator.length = page.total_elements ?? 0;
      }
    });
  }

  /**
   * Connects the data source to the collection viewer.
   * @param collectionViewer The collection viewer to connect to.
   * @returns An observable of the data to display.
   */
  override connect(collectionViewer: CollectionViewer): Observable<readonly T[]> {
    this._fetchData();
    return this._data.asObservable();
  }

  /**
   * Disconnects the data source from the collection viewer.
   * Needed by the interface but not used in this implementation.
   * @param collectionViewer The collection viewer to disconnect from.
   */
  override disconnect(collectionViewer: CollectionViewer): void {
    console.log('Disconnecting data source');
  }

}
