import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { OrderResponseDTO, OrdersService } from '../../api';
import { GenericTableComponent } from "../../components/generic-table/generic-table.component";
import { orderDisplayNames } from '../../display-name-mappings/order-display-names';
import { TableColumn } from '../../models/generic-table';

@Component({
  selector: 'app-orders-table',
  imports: [GenericTableComponent],
  templateUrl: './orders-table.component.html',
  styleUrl: './orders-table.component.css'
})
export class OrdersTableComponent implements OnInit {

  dataSource = new MatTableDataSource<OrderResponseDTO>([]);
  columns: TableColumn[] = [];

  constructor(private readonly router: Router) { }

  ngOnInit() {
    OrdersService.getAllOrders().then(orders => {
      console.log('Fetched orders:', orders);
      this.dataSource.data = orders;
    });
    this.columns = [
      { id: 'order_id', label: orderDisplayNames['id'] }, // TODO: uncomment after generic table update. action: order => this.router.navigateByUrl('/orders/' + order.id) },
      { id: 'order_content_description', label: orderDisplayNames['content_description'] },
      { id: 'order_status', label: orderDisplayNames['status'] },
      { id: 'primary_cost_center_id', label: orderDisplayNames['primary_cost_center_id'] },
      { id: 'secondary_cost_center_id', label: orderDisplayNames['secondary_cost_center_id'] },
      { id: 'supplier_name', label: orderDisplayNames['supplier_id'] },
      { id: 'order_last_updated_time', label: orderDisplayNames['last_updated_time'] }
    ];
  }

}
