import { Component, input } from '@angular/core';
import { MatDividerModule } from "@angular/material/divider";
import { ORDER_FIELD_LABELS } from '../../display-name-mappings/order-names';
import { DisplayableOrder } from '../../models/displayable-order';
import { OrderDisplayData } from '../../models/order-display-data';

@Component({
  selector: 'app-order-details',
  imports: [
    MatDividerModule
  ],
  templateUrl: './order-details.component.html',
  styleUrl: './order-details.component.scss'
})
export class OrderDetailsComponent {

  orderData = input.required<DisplayableOrder>();
  fieldLabels = ORDER_FIELD_LABELS;

  generalDetailsFields: (keyof OrderDisplayData)[] = [
    'primary_cost_center_id',
    'secondary_cost_center_id',
    'booking_year',
    'auto_index',
    'legacy_alias',
    'dfg_key',
    'created_date',
    'last_updated_time',
  ];

}
