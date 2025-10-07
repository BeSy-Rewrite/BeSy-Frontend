import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { FilterMenuComponent } from '../../../components/filter-menu/filter-menu.component';
import { GenericTableComponent } from '../../../components/generic-table/generic-table.component';
import { ordersTableConfig } from '../../../configs/orders-table-config';
import { ActiveFilters } from '../../../models/filter-menu-types';
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

  /**
   * Constructor for the OrdersPageComponent.
   * @param router - Angular Router for navigation.
   */
  constructor(private readonly router: Router) {
    // Set actions for specific columns in the table.
    ordersTableConfig.filter(col => ['id', 'besy_number'].includes(col.id))
      .forEach(col => col.action = (row) => this.onViewOrder(row));
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
}
