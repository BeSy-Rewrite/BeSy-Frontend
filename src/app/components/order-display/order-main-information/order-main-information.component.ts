import { Component, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from "@angular/material/divider";
import { ORDER_FIELD_NAMES } from '../../../display-name-mappings/order-names';
import { DisplayableOrder } from '../../../models/displayable-order';
import { OrderDisplayData } from '../../../models/order-display-data';
import { AddressDisplayComponent } from '../address-display/address-display.component';

@Component({
  selector: 'app-order-main-information',
  imports: [
    MatDividerModule,
    MatButtonModule,
    AddressDisplayComponent,
  ],
  templateUrl: './order-main-information.component.html',
  styleUrl: './order-main-information.component.scss'
})
export class OrderMainInformationComponent {

  /** The order data to display */
  orderData = input.required<DisplayableOrder>();

  orderFieldLabels = ORDER_FIELD_NAMES;

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
