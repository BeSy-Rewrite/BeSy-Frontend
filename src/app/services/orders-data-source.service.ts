import { CollectionViewer } from '@angular/cdk/collections';
import { DataSource } from '@angular/cdk/table';
import { computed, Injectable, signal } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { BehaviorSubject, debounceTime, forkJoin, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { OrderResponseDTO, OrderStatus, PagedOrderResponseDTO } from '../api';
import { DataSourceSorting } from '../models/datasource-sorting';
import { ActiveFilters } from '../models/filter-menu-types';
import { FilterRequestParams } from '../models/filter-request-params';
import { OrderDisplayData } from '../models/order-display-data';
import { CachedOrdersService } from './cached-orders.service';
import { OrderSubresourceResolverService } from './order-subresource-resolver.service';


@Injectable({
  providedIn: 'root'
})
export class OrdersDataSourceService<T> extends DataSource<T> {
  private static readonly DEFAULT_PAGE_SIZE = 25;

  private readonly _data: BehaviorSubject<any[]>;
  private _paginator: MatPaginator | undefined;
  private _sort: MatSort | undefined;
  private _filter: ActiveFilters | undefined;
  private readonly _requestFetch: BehaviorSubject<void> | undefined;
  private _searchTerm: string | undefined;

  private readonly _sorting = signal<string[]>([]);

  private _nextPagination: { pageIndex: number; pageSize: number; } | undefined;
  private _nextSorting: string[] | undefined;

  constructor(private readonly cacheService: CachedOrdersService, private readonly subresourceResolver: OrderSubresourceResolverService) {
    super();
    this._data = new BehaviorSubject<OrderResponseDTO[]>([]);

    this._requestFetch = new BehaviorSubject<void>(undefined);
    this._requestFetch.pipe(
      debounceTime(environment.searchAndFilterDebounceMs))
      .subscribe(() => {
        this._fetchData();
      });
  }

  setNextPagination(pageIndex: number, pageSize: number) {
    this._nextPagination = { pageIndex, pageSize };
    this._requestFetch?.next();
  }

  setNextSorting(sorting: DataSourceSorting[]) {
    this._nextSorting = sorting.map(s => `${this.snakeToCamel(s.id)},${s.direction}`);
  }

  sorting = computed<DataSourceSorting[]>(() => {
    const sorting = this._sorting().map(s => {
      const [id, direction] = s.split(',');
      return { id: this.camelToSnake(id), direction: direction === 'desc' ? 'desc' : 'asc' } as DataSourceSorting;
    });
    return sorting;
  });

  /**
   * The data to be displayed by the table.
   * This is a required property and must be set for the table to function.
   * @returns The current data array.
   */
  get data(): OrderDisplayData[] {
    return this._data.value;
  }
  /**
   * Sets the data to be displayed by the table.
   * Triggers an update to the table display.
   * @param data The new data array.
   */
  set data(data: OrderResponseDTO[]) {
    data = Array.isArray(data) ? data : [];
    let displayData: Observable<OrderDisplayData>[] = [];
    if (data.length === 0) {
      this._data.next([]);
      return;
    }
    data.forEach(order => {
      if (order) {
        displayData.push(this.subresourceResolver.resolveOrderSubresources(order));
      }
    });
    forkJoin(displayData).subscribe(resolvedData => {
      this._data.next(resolvedData);
    });
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
      this._requestFetch?.next();
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
        this._sorting.set([]);
      } else {
        const sortIndex = this._sorting().findIndex(s => s.startsWith(sort.active + ','));
        if (sortIndex !== -1) {
          this._sorting.update(s => {
            const newS = [...s];
            newS.splice(sortIndex, 1);
            return newS;
          });
        }

        this._sorting.update(s => [sort.active + ',' + sort.direction, ...s]);
      }

      this._requestFetch?.next();
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
    this._requestFetch?.next();
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
    this._searchTerm = searchTerm.toLowerCase().trim();
    this._requestFetch?.next();
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
      createdAfter: this._filter?.created_date?.start?.toISOString(),
      createdBefore: this._filter?.created_date?.end?.toISOString(),
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
      lastUpdatedTimeAfter: this._filter?.last_updated_time?.start?.toISOString(),
      lastUpdatedTimeBefore: this._filter?.last_updated_time?.end?.toISOString(),
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
   * Converts a camelCase string to snake_case.
   * @param s The camelCase string to convert.
   * @returns The converted snake_case string.
   */
  private camelToSnake(s: string): string {
    return s.replace(/([A-Z])/g, '_$1').toLowerCase();
  }

  /**
   * Fetches data from the backend API using the current paginator, sort, filter, and search term.
   * Updates the data and paginator properties with the fetched data.
   */
  _fetchData() {
    if (this._nextPagination) {
      if (this._paginator) {
        this._paginator.pageIndex = this._nextPagination.pageIndex;
        this._paginator.pageSize = this._nextPagination.pageSize;
        this._nextPagination = undefined;
      }
    }
    if (this._nextSorting) this._sorting.set(this._nextSorting);

    this.cacheService.getAllOrders(
      this._paginator?.pageIndex ?? 0,
      this._paginator?.pageSize ?? OrdersDataSourceService.DEFAULT_PAGE_SIZE,
      this._sorting(),
      this.getFilterRequestParams(),
      this._searchTerm ?? ''
    ).subscribe((page: PagedOrderResponseDTO) => {
      this.data = page.content ?? [];

      if (this._paginator) {
        this._paginator.pageIndex = page.number ?? 0;
        this._paginator.pageSize = page.size ?? OrdersDataSourceService.DEFAULT_PAGE_SIZE;
        this._paginator.length = page.total_elements ?? 0;
      }
      if (this._sort && this._sorting().length > 0 && this._sort.active === undefined) {
        this._sort.active = this.camelToSnake(this._sorting()[0]?.split(',')[0]);
        this._sort.direction = (this._sorting()[0]?.split(',')[1] ?? 'asc') as 'asc' | 'desc' | '';
        this._sort.ngOnChanges();
      }
      this._nextSorting = undefined;
    });
  }

  /**
   * Connects the data source to the collection viewer.
   * @param collectionViewer The collection viewer to connect to.
   * @returns An observable of the data to display.
   */
  override connect(collectionViewer: CollectionViewer): Observable<readonly T[]> {
    this._requestFetch?.next();
    return this._data.asObservable();
  }

  /**
   * Disconnects the data source from the collection viewer.
   * Needed by the interface but not used in this implementation.
   * @param collectionViewer The collection viewer to disconnect from.
   */
  override disconnect(collectionViewer: CollectionViewer): void {
    // Method required by interface; no action needed.
  }

}
