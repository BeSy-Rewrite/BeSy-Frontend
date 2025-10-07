import { Component, inject, viewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router';
import { FilterMenuComponent } from '../../../components/filter-menu/filter-menu.component';
import { GenericTableComponent } from '../../../components/generic-table/generic-table.component';
import { ORDERS_FILTER_MENU_CONFIG } from '../../../configs/orders-filter-menu-config';
import { ordersTableConfig } from '../../../configs/orders-table-config';
import { ActiveFilters } from '../../../models/filter-menu-types';
import { ChipFilterPreset, DateRangeFilterPreset, FilterPresetParams, OrdersFilterPreset, RangeFilterPreset } from '../../../models/filter-presets';
import { ButtonColor, TableActionButton } from '../../../models/generic-table';
import { OrderDisplayData } from '../../../models/order-display-data';
import { OrdersDataSourceService } from '../../../services/orders-data-source.service';

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
    FilterMenuComponent
  ],
  templateUrl: './orders-page.component.html',
  styleUrl: './orders-page.component.scss'
})
export class OrdersPageComponent {
  /** Columns to display in the orders table. */
  ordersTableColumns = [...ordersTableConfig];

  /** Data source for the orders table. */
  ordersDataSource = inject(OrdersDataSourceService);

  /** Actions available for each row in the table. */
  actions: TableActionButton[] = [
    { id: 'view', label: 'Ansehen', buttonType: 'filled', color: ButtonColor.PRIMARY, action: (row) => this.onViewOrder(row) }
  ];

  /** Flag to show or hide filters. */
  showFilters = false;

  /** Flag to control the visibility of the filter button. */
  showFilterButton = true;

  routeSnapshot: ActivatedRouteSnapshot;

  filterMenu = viewChild.required(FilterMenuComponent);
  initialPreset: OrdersFilterPreset | undefined = undefined;

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
    ordersTableConfig.filter(col => ['id', 'besy_number'].includes(col.id))
      .forEach(col => col.action = (row) => this.onViewOrder(row));

    if (Object.keys(this.routeSnapshot.queryParams).length > 0) {
      this.initialPreset = this.parseFilterPresetFromUrlParams();
    }
  }

  /**
   * Updates the visible columns in the orders table based on user selection.
   * @param selected - Array of selected column IDs to display.
   */
  onSelectedColumnsChanged(selected: string[]) {
    this.ordersTableColumns = ordersTableConfig.map(col => ({
      ...col,
      isInvisible: !selected?.includes(col.id)
    }));
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
    this.router.navigate([], { queryParams: this.getFiltersAsParams() });
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
    this.router.navigate(['/orders', order.id]);
  }

  parseFilterPresetFromUrlParams() {
    const params = this.routeSnapshot.queryParams;
    const preset: OrdersFilterPreset = {
      label: 'urlParams',
      appliedFilters: []
    };
    let filterSettings: (ChipFilterPreset | DateRangeFilterPreset | RangeFilterPreset) | undefined;
    for (const [key, value] of Object.entries(params)) {
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
          console.warn(`Unknown filter type for key: ${key}`);
          this._snackBar.open(`Unbekannter Filtertyp für Schlüssel: ${key}. Bitte überprüfen Sie Ihre URL-Parameter.`, 'Schließen', { duration: 5000 });
      }

      if (filterSettings) {
        preset.appliedFilters.push(filterSettings);
      }
    }
    console.log('Loaded filter preset from URL params:', preset);
    return preset;
  }

  parseChipParams(key: string, value: string): ChipFilterPreset | undefined {
    if (value) {
      const chipIds = value.split(',');

      return {
        id: key as keyof ActiveFilters,
        chipIds
      };
    }
    return undefined;
  }

  parseDateRangeParams(key: string, value: string): DateRangeFilterPreset | undefined {
    if (value) {
      const [start, end] = value.split('_');

      return {
        id: key as keyof ActiveFilters,
        dateRange: {
          start: start ? new Date(start) : null,
          end: end ? new Date(end) : null
        }
      };
    }
    return undefined;
  }

  parseRangeParams(key: string, value: string): RangeFilterPreset | undefined {
    if (value) {
      const [start, end] = value.split('-').map((v: string) => v === 'Infinity' ? Infinity : parseFloat(v));

      return {
        id: key as keyof ActiveFilters,
        range: { start, end }
      };
    }
    return undefined;
  }

  areParamsValid(params: FilterPresetParams): boolean {
    // Implement validation of URL parameters
    return false;
  }

  /**
   * Converts the active filters into URL parameters for navigation.
   * @returns An object mapping filter keys to their stringified values.
   */
  getFiltersAsParams(): FilterPresetParams {
    const params: FilterPresetParams = {} as any;
    this.filterMenu().activeFiltersSignal().appliedFilters.forEach(filter => {
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
          this._snackBar.open('Fehler beim Verarbeiten eines Datumsfilters. Bitte überprüfen Sie Ihre Filtereinstellungen.', 'Schließen', { duration: 5000 });
        }

        params[filter.id] = (start ?? '') + '_' + (end ?? '');
      }
      // Remove undefined parameters
      if ([undefined, null, '', '-', '_'].includes(params[filter.id])) {
        delete params[filter.id];
      }
    });
    return params;
  }
}
