import { Component, input } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { DisplayableOrder } from '../../../models/displayable-order';
import { AddressDisplayComponent } from '../address-display/address-display.component';

@Component({
  selector: 'app-order-addresses',
  imports: [
    AddressDisplayComponent
  ],
  templateUrl: './order-addresses.component.html',
  styleUrl: './order-addresses.component.scss',
})
export class OrderAddressesComponent {
  environment = environment;

  /** The order data to display */
  orderData = input.required<DisplayableOrder>();
}
