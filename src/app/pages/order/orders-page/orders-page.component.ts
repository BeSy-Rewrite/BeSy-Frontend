import { Component, inject, OnInit, viewChild } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, ActivatedRouteSnapshot, Params, Router } from '@angular/router';
import { FilterMenuComponent } from '../../../components/filter/filter-menu/filter-menu.component';
import { GenericTableComponent } from '../../../components/generic-table/generic-table.component';
import { ORDERS_FILTER_MENU_CONFIG } from '../../../configs/orders-table/orders-filter-menu-config';
import { ordersTableConfig } from '../../../configs/orders-table/orders-table-config';
import { DataSourceSorting } from '../../../models/datasource-sorting';
import { ActiveFilters } from '../../../models/filter/filter-menu-types';
import {
  ChipFilterPreset,
  DateRangeFilterPreset,
  FilterPresetParams,
  FilterPresetType,
  OrdersFilterPreset,
  RangeFilterPreset,
} from '../../../models/filter/filter-presets';
import { ButtonColor, TableActionButton } from '../../../models/generic-table';
import { OrderDisplayData } from '../../../models/order-display-data';
import { OrdersDataSourceService } from '../../../services/orders-data-source.service';
import { CreateOrderPageComponent } from '../create-order-page/create-order-page.component';

/**
 * Component for managing the orders page.
 */
@Component({
  selector: 'app-orders-page',
  imports: [
    MatIconModule,
    MatSidenavModule,
    MatButtonModule,
    MatTabsModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatDividerModule,
    GenericTableComponent,
    FilterMenuComponent,
    CreateOrderPageComponent,
  ],
  templateUrl: './orders-page.component.html',
  styleUrl: './orders-page.component.scss',
})
export class OrdersPageComponent implements OnInit {
  /** Columns to display in the orders table. */
  ordersTableColumns = [...ordersTableConfig];

  /** Data source for the orders table. */
  ordersDataSource = inject(OrdersDataSourceService);

  /** Actions available for each row in the table. */
  actions: TableActionButton[] = [
    {
      id: 'view',
      label: 'Ansehen',
      buttonType: 'filled',
      color: ButtonColor.PRIMARY,
      action: row => this.onViewOrder(row),
    },
  ];

  /** Flag to show or hide filters. */
  showFilters = false;

  /** Flag to control the visibility of the filter button. */
  showFilterButton = true;

  routeSnapshot: ActivatedRouteSnapshot;

  filterMenu = viewChild.required(FilterMenuComponent);
  initialPreset: OrdersFilterPreset | undefined = undefined;

  ordersTable = viewChild.required(GenericTableComponent);

  private readonly dataSourceService = inject(OrdersDataSourceService);

  /**
   * Constructor for the OrdersPageComponent.
   * @param router - Angular Router for navigation.
   */
  constructor(
    private readonly router: Router,
    route: ActivatedRoute,
    private readonly _snackBar: MatSnackBar
  ) {
    this.routeSnapshot = route.snapshot;
    // Set actions for specific columns in the table.
    for (const col of ordersTableConfig.filter(col => ['id', 'besy_number'].includes(col.id))) {
      col.action = row => this.onViewOrder(row);
    }

    if (Object.keys(this.routeSnapshot.queryParams).length > 0) {
      const presetParams: Params = {};
      const queryParams = this.routeSnapshot.queryParams;

      for (const key of Object.keys(queryParams)) {
        presetParams[key] = queryParams[key];
      }
      this.initialPreset = this.parseFilterPresetFromUrlParams(presetParams);
    }

    toObservable(this.dataSourceService.sorting).subscribe(() => this.updateUrlParams());
  }
  /**
   * Lifecycle hook that is called after data-bound properties are initialized.
   * Initializes pagination and sorting from URL parameters.
   */
  ngOnInit() {
    const pagination = this.parsePaginationFromUrlParams(this.routeSnapshot.queryParams);
    this.dataSourceService.setNextPagination(pagination.pageIndex, pagination.pageSize);

    const sorting = this.parseSortingFromUrlParams(this.routeSnapshot.queryParams);
    if (sorting) {
      this.dataSourceService.setNextSorting(sorting);
    }

    this.ordersTable()
      .paginator()
      .page.subscribe(() => this.updateUrlParams());
  }

  /**
   * Updates the visible columns in the orders table based on user selection.
   * @param selected - Array of selected column IDs to display.
   */
  onSelectedColumnsChanged(selected: string[]) {
    this.ordersTableColumns = ordersTableConfig.map(col => ({
      ...col,
      isInvisible: !selected?.includes(col.id),
    }));
    this.updateUrlParams();
  }

  /**
   * Toggles the visibility of the filter section.
   */
  toggleShowFilters() {
    this.showFilters = !this.showFilters;
  }

  /**
   * Updates the data source filters based on the selected filters.
   * @param filters - The active filters to apply.
   */
  onFiltersChanged(filters: ActiveFilters) {
    this.ordersDataSource.filter = filters;
    this.updateUrlParams();
  }

  /**
   * Handles tab change events.
   * @param $event - The event containing the tab change information.
   */
  onTabChanged($event: MatTabChangeEvent) {
    this.showFilterButton = $event.index === 0;
  }

  /**
   * Navigates to the order details page for the selected order.
   * @param order - The order to view.
   */
  onViewOrder(order: OrderDisplayData) {
    let id = order.id;
    if (order.besy_number?.split('-').length === 3) {
      id = order.besy_number;
    }
    this.router.navigate(['/orders', id]);
  }

  onFiltersReset() {
    this.dataSourceService.setNextSorting([{ id: 'last_updated_time', direction: 'asc' }]);
    this.updateUrlParams();
  }

  /**
   * Updates the URL parameters to reflect the current filters, pagination, and sorting.
   */
  updateUrlParams() {
    this.router.navigate([], {
      queryParams: {
        ...this.getFiltersAsParams(),
        ...this.getPaginationAsParams(),
        ...this.getSortingAsParams(),
      },
    });
  }

  /**
   * Parses sorting information from URL parameters.
   * @param params - The URL parameters to parse.
   * @returns A MatSortable object if sorting parameters are present, otherwise undefined.
   */
  parseSortingFromUrlParams(params: Params) {
    if (!params['sort_by']) {
      return undefined;
    }
    const sortParams: string[] = params['sort_by'].split(';');
    const sorting = sortParams.map((sortParam: string) => {
      if (sortParam) {
        const [id, direction] = sortParam.split(',');
        return { id, direction: direction === 'desc' ? 'desc' : 'asc' } as DataSourceSorting;
      }
      return undefined;
    });
    return sorting.filter(s => s !== undefined);
  }

  /**
   * Parses pagination information from URL parameters.
   * @param params - The URL parameters to parse.
   * @returns An object containing pageIndex and pageSize.
   */
  parsePaginationFromUrlParams(params: Params): { pageIndex: number; pageSize: number } {
    const pageIndex = params['page'] ? (Number.parseInt(params['page'], 10) ?? 0) : 0;
    const pageSize = params['page_size'] ? (Number.parseInt(params['page_size'], 10) ?? 25) : 25;
    return { pageIndex, pageSize };
  }

  /**
   * Parses URL parameters to create a filter preset.
   * Supports chip, date range, and range filters.
   * @returns An OrdersFilterPreset constructed from the URL parameters.
   */
  parseFilterPresetFromUrlParams(params: Params) {
    const preset: OrdersFilterPreset = {
      label: 'urlParams',
      appliedFilters: [],
    };
    for (const [key, value] of Object.entries(params)) {
      let filterSettings: FilterPresetType | undefined;
      switch (ORDERS_FILTER_MENU_CONFIG.find(f => f.key === key)?.type) {
        case 'select':
          filterSettings = this.parseChipParams(key, value);
          break;

        case 'date-range':
          filterSettings = this.parseDateRangeParams(key, value);
          break;

        case 'range':
          filterSettings = this.parseRangeParams(key, value);
          break;
        default:
          if (key === 'selectedColumnIds' && value) {
            filterSettings = { id: 'selectedColumnIds', selectedColumnIds: value.split(',') };
          }
      }

      if (filterSettings) {
        preset.appliedFilters.push(filterSettings);
      }
    }
    return preset;
  }

  /** Parses chip filter parameters from the URL. */
  parseChipParams(key: string, value: string): ChipFilterPreset | undefined {
    if (value) {
      const chipIds = value.split(',');

      return {
        id: key as keyof ActiveFilters,
        chipIds,
      };
    }
    return undefined;
  }

  /** Parses date range filter parameters from the URL. */
  parseDateRangeParams(key: string, value: string): DateRangeFilterPreset | undefined {
    if (value) {
      const [start, end] = value.split('_');

      return {
        id: key as keyof ActiveFilters,
        dateRange: {
          start: start ? new Date(start) : null,
          end: end ? new Date(end) : null,
        },
      };
    }
    return undefined;
  }

  /** Parses range filter parameters from the URL. */
  parseRangeParams(key: string, value: string): RangeFilterPreset | undefined {
    if (value) {
      const [start, end] = value.split('-').map((v: string) => Number.parseFloat(v));

      return {
        id: key as keyof ActiveFilters,
        range: { start, end },
      };
    }
    return undefined;
  }

  /**
   * Converts the active filters into URL parameters for navigation.
   * @returns An object mapping filter keys to their stringified values.
   */
  getFiltersAsParams(): FilterPresetParams {
    const params: FilterPresetParams = {} as any;

    for (const filter of this.filterMenu().activeFiltersSignal().appliedFilters) {
      if ('chipIds' in filter) {
        params[filter.id] = filter.chipIds.join(',');
      } else if ('range' in filter) {
        params[filter.id] = filter.range.start + '-' + filter.range.end;
      } else if ('dateRange' in filter) {
        let start = null;
        let end = null;
        try {
          start = filter.dateRange.start?.toISOString().split('T')[0];
          end = filter.dateRange.end?.toISOString().split('T')[0];
        } catch (e) {
          console.error('Error converting date range to string:', e);
          this._snackBar.open(
            'Fehler beim Verarbeiten eines Datumsfilters. Bitte überprüfen Sie Ihre Filtereinstellungen.',
            'Schließen',
            { duration: 5000 }
          );
        }

        params[filter.id] = (start ?? '') + '_' + (end ?? '');
      } else if ('selectedColumnIds' in filter) {
        params['selectedColumnIds'] = filter.selectedColumnIds.join(',');
      }
      // Remove undefined parameters
      if ([undefined, null, '', '-', '_'].includes(params[filter.id])) {
        delete params[filter.id];
      }
    }
    return params;
  }

  /**
   * Converts the current pagination state into URL parameters for navigation.
   * @returns An object mapping pagination keys to their values.
   */
  getPaginationAsParams() {
    const params: { page?: number; page_size?: number } = {};
    if (this.ordersTable().paginator()) {
      params['page'] = this.ordersTable().paginator().pageIndex;
      params['page_size'] = this.ordersTable().paginator().pageSize;
    }
    return params;
  }

  /**
   * Converts the current sorting state into URL parameters for navigation.
   * @returns An object mapping sorting keys to their values.
   */
  getSortingAsParams() {
    const params: { sort_by?: string } = {};
    const sorting = this.dataSourceService.sorting();
    if (this.ordersTable().sort()) {
      params['sort_by'] = sorting.map(s => `${s.id},${s.direction}`).join(';');
    }
    return params.sort_by ? params : {};
  }
}
