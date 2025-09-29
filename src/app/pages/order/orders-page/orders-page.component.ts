import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { FilterMenuComponent } from '../../../components/filter-menu/filter-menu.component';
import { GenericTableComponent } from '../../../components/generic-table/generic-table.component';
import { ordersTableConfig } from '../../../configs/orders-table-config';
import { ActiveFilters } from '../../../models/filter-menu-types';
import { ButtonColor, TableActionButton } from '../../../models/generic-table';
import { OrdersDataSourceService } from '../../../services/orders-data-source.service';

@Component({
  selector: 'app-orders-page',
  imports: [
    MatIconModule,
    MatSidenavModule,
    MatButtonModule,
    MatTabGroup,
    MatTab,
    MatDivider,
    GenericTableComponent,
    FilterMenuComponent,
  ],
  templateUrl: './orders-page.component.html',
  styleUrl: './orders-page.component.css'
})
export class OrdersPageComponent {
  ordersTableColumns = [...ordersTableConfig];

  ordersDataSource = inject(OrdersDataSourceService);
  actions: TableActionButton[] = [
    { id: 'view', label: 'Ansehen', buttonType: 'filled', color: ButtonColor.PRIMARY, action: (row) => this.onViewOrder(row) }
  ];

  showFilters = false;

  constructor(private readonly router: Router) {
    ordersTableConfig.filter(col => ['id', 'besy_number'].includes(col.id))
      .forEach(col => col.action = (row) => this.onViewOrder(row));
  }

  toggleShowFilters() {
    this.showFilters = !this.showFilters;
  }

  onFiltersChanged(filters: ActiveFilters) {
    this.ordersDataSource.filter = filters;
  }

  onViewOrder(order: any) {
    console.log('Viewing order:', order);
    this.router.navigate(['/orders', order.id]);
  }
}
