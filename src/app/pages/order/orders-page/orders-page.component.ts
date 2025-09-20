import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { FilterMenuComponent } from '../../../components/filter-menu/filter-menu.component';
import { GenericTableComponent } from '../../../components/generic-table/generic-table.component';
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
  animations: [
    trigger('slide', [
      state('true', style({ transform: 'translateX(0)' })),
      state('false', style({ transform: 'translateX(-25rem)' })),
      transition('* => *', animate("200ms ease-in-out"))
    ]),
    trigger('expand', [
      state('true', style({ transform: 'translateX(0)' })),
      state('false', style({ transform: 'translateX(25rem)', width: 'calc(100% - 25rem)' })),
      transition('* => *', animate("200ms ease-in-out"))
    ])
  ],
  templateUrl: './orders-page.component.html',
  styleUrl: './orders-page.component.css'
})
export class OrdersPageComponent {
  ordersTableColumns = [
    { id: 'id', label: 'Bestellnummer', action: (row: any) => this.onViewOrder(row) },
    { id: 'status', label: 'Status' },
    { id: 'content_description', label: 'Beschreibung' },
    { id: 'primary_cost_center_id', label: 'Kostenstelle' },
    { id: 'supplier_id', label: 'Lieferant' },
    { id: 'last_updated_time', label: 'Änderungsdatum' }

  ];
  ordersDataSource = inject(OrdersDataSourceService);
  actions: TableActionButton[] = [
    { id: 'delete', label: 'Löschen', buttonType: 'outlined', color: ButtonColor.WARN, action: (row) => this.onDeleteOrder(row) },
    { id: 'edit', label: 'Bearbeiten', buttonType: 'outlined', color: ButtonColor.PRIMARY, action: (row) => this.onEditOrder(row) },
    { id: 'view', label: 'Ansehen', buttonType: 'filled', color: ButtonColor.PRIMARY, action: (row) => this.onViewOrder(row) }

  ]; // Placeholder for order action buttons

  showFilters = false;

  constructor(private readonly router: Router) { }

  toggleShowFilters() {
    this.showFilters = !this.showFilters;
  }

  onFiltersChanged(filters: ActiveFilters) {
    console.log('Filters changed in OrdersPageComponent:', filters);
    // Here you can implement logic to filter the ordersDataSource based on the received filters
    // For example, you could fetch new data or filter the existing data based on the filters
    this.ordersDataSource.filter = filters;
  }

  onViewOrder(order: any) {
    console.log('Viewing order:', order);
    this.router.navigate(['/orders', order.id]);
  }

  onEditOrder(order: any) {
    this.router.navigate(['/orders', order.id, 'edit']);
  }

  onDeleteOrder(order: any) {
    // ToDo: Implement order deletion logic here
    console.log('Deleting order:', order);
  }
}
