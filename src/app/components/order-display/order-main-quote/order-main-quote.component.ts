import { Component, input, OnChanges, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from "@angular/material/divider";
import { from } from 'rxjs';
import { ORDER_FIELD_NAMES } from '../../../display-name-mappings/order-names';
import { DisplayableOrder } from '../../../models/displayable-order';
import { OrderDisplayData } from '../../../models/order-display-data';
import { OrderSubresourceResolverService } from '../../../services/order-subresource-resolver.service';
import { OrdersWrapperService } from '../../../services/wrapper-services/orders-wrapper.service';

@Component({
  selector: 'app-order-main-quote',
  imports: [
    MatDividerModule,
    MatButtonModule
  ],
  templateUrl: './order-main-quote.component.html',
  styleUrl: './order-main-quote.component.scss'
})
export class OrderMainQuoteComponent implements OnInit, OnChanges {

  orderData = input.required<DisplayableOrder>();

  orderFieldLabels = ORDER_FIELD_NAMES;

  private currencyCode = 'EUR';

  isPriceProbablyBrutto = false;
  isPriceProbablyNetto = false;

  totalGrossPriceFormatted = '';
  totalNetPriceFormatted = '';

  additionalInfoKeys: (keyof OrderDisplayData)[] = [
    'quote_number',
    'quote_date',
    'quote_price',
    'quote_sign',
    'currency',
  ];

  constructor(private readonly ordersService: OrdersWrapperService,
    private readonly subresourceService: OrderSubresourceResolverService
  ) { }

  ngOnInit(): void {
    this.loadOrderItems();
  }

  ngOnChanges(): void {
    if (this.orderData()) {
      this.loadOrderItems();
    }
  }

  /** Loads the items for the current order and computes totals. */
  private loadOrderItems(): void {
    from(this.ordersService.getOrderItems(this.orderData().order.id)).subscribe(items => {
      this.currencyCode = this.orderData().order.currency?.code ?? this.currencyCode;

      const totalGrossPrice = this.subresourceService.calculateTotalGrossPrice(items);
      const totalNetPrice = this.subresourceService.calculateTotalNetPrice(items);

      this.isPriceProbablyBrutto = this.isQuotePriceEqualsTo(totalGrossPrice);
      this.isPriceProbablyNetto = this.isQuotePriceEqualsTo(totalNetPrice);

      this.totalNetPriceFormatted = this.subresourceService.formatPrice(totalNetPrice, this.currencyCode) + '\u00A0(netto)';
      this.totalGrossPriceFormatted = this.subresourceService.formatPrice(totalGrossPrice, this.currencyCode) + '\u00A0(brutto)';
    });
  }

  /** Checks whether the given price is approximately equal to the quote price of the order. */
  private isQuotePriceEqualsTo(price: number): boolean {
    const quotePrice = this.orderData().order['quote_price'];
    return Math.abs((quotePrice ?? 0) - price) < 0.01;
  }

}
