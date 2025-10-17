import { DataSource } from '@angular/cdk/table';
import { Component, input } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { OrderResponseDTO, OrderStatusHistoryResponseDTO } from '../../api';
import { STATE_HISTORY_FIELD_NAMES } from '../../display-name-mappings/state-history-names';
import { STATE_DISPLAY_NAMES, STATE_ICONS } from '../../display-name-mappings/status-names';
import { TableColumn } from '../../models/generic-table';
import { OrdersWrapperService } from '../../services/wrapper-services/orders-wrapper.service';
import { GenericTableComponent } from "../generic-table/generic-table.component";

@Component({
  selector: 'app-state-history',
  imports: [GenericTableComponent],
  templateUrl: './state-history.component.html',
  styleUrl: './state-history.component.scss'
})
export class StateHistoryComponent {
  order = input.required<OrderResponseDTO>();
  stateHistory: OrderStatusHistoryResponseDTO[] = [];

  stateHistoryFieldNames = STATE_HISTORY_FIELD_NAMES;
  stateNames = STATE_DISPLAY_NAMES;
  stateIcons = STATE_ICONS;

  dataSource: DataSource<{ status: string; timestamp: string }> = new MatTableDataSource();
  columns: TableColumn[] = [
    { id: 'timestamp', label: this.stateHistoryFieldNames['timestamp'] },
    { id: 'status', label: this.stateHistoryFieldNames['status'] }
  ];

  constructor(private readonly ordersService: OrdersWrapperService) { }

  fetchStateHistory(): void {
    this.ordersService.getOrderStatusHistory(this.order().id ?? 0).then(history => {
      this.stateHistory = history;
      const formattedHistory = this.stateHistory.map(entry => ({
        status: `${this.stateIcons.get(entry.status.toString() ?? '')} ${this.stateNames.get(entry.status.toString() ?? '')}`,
        timestamp: new Date(entry.timestamp).toLocaleString()
      }));
      this.dataSource = new MatTableDataSource(formattedHistory);
    });
  }
}
