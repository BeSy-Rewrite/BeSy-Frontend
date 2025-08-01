import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { OrderResponseDTO, OrdersService } from '../../api';
import { GenericTableComponent } from "../../components/generic-table/generic-table.component";
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

  ngOnInit() {
    OrdersService.getAllOrders().then(orders => {
      console.log('Fetched orders:', orders);
      this.dataSource.data = orders;
    });
    this.columns = [
      { id: 'id', label: 'ID' },
      { id: 'primary_cost_center_id', label: 'Primary Cost Center ID' },
      { id: 'booking_year', label: 'Booking Year' },
      { id: 'auto_index', label: 'Auto Index' },
      { id: 'created_date', label: 'Created Date' },
      { id: 'legacy_alias', label: 'Legacy Alias' },
      { id: 'owner_id', label: 'Owner ID' },
      { id: 'content_description', label: 'Content Description' },
      { id: 'status', label: 'Status' },
      { id: 'currency_short', label: 'Currency Short' },
      { id: 'comment', label: 'Comment' },
      { id: 'comment_for_supplier', label: 'Comment for Supplier' },
      { id: 'quote_number', label: 'Quote Number' },
      { id: 'quote_sign', label: 'Quote Sign' },
      { id: 'quote_date', label: 'Quote Date' },
      { id: 'quote_price', label: 'Quote Price' },
      { id: 'delivery_person_id', label: 'Delivery Person ID' },
      { id: 'invoice_person_id', label: 'Invoice Person ID' },
      { id: 'queries_person_id', label: 'Queries Person ID' },
      { id: 'customer_id', label: 'Customer ID' },
      { id: 'supplier_id', label: 'Supplier ID' },
      { id: 'secondary_cost_center_id', label: 'Secondary Cost Center ID' },
      { id: 'fixed_discount', label: 'Fixed Discount' },
      { id: 'percentage_discount', label: 'Percentage Discount' },
      { id: 'cash_discount', label: 'Cash Discount' },
      { id: 'cashback_days', label: 'Cashback Days' },
      { id: 'last_updated_time', label: 'Last Updated Time' },
      { id: 'flag_decision_cheapest_offer', label: 'Decision Cheapest Offer' },
      { id: 'flag_decision_sole_supplier', label: 'Decision Sole Supplier' },
      { id: 'flag_decision_contract_partner', label: 'Decision Contract Partner' },
      { id: 'flag_decision_other_reasons', label: 'Decision Other Reasons' },
      { id: 'decision_other_reasons_description', label: 'Decision Other Reasons Description' },
      { id: 'flag_edv_permission', label: 'EDV Permission' },
      { id: 'flag_furniture_permission', label: 'Furniture Permission' },
      { id: 'flag_furniture_room', label: 'Furniture Room' },
      { id: 'flag_investment_room', label: 'Investment Room' },
      { id: 'flag_investment_structural_measures', label: 'Investment Structural Measures' },
      { id: 'flag_media_permission', label: 'Media Permission' },
      { id: 'dfg_key', label: 'DFG Key' }
    ];
  }

}
