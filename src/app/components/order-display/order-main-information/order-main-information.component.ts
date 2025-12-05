import { DataSource } from '@angular/cdk/table';
import { Component, computed, input, OnChanges, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableDataSource } from '@angular/material/table';
import { ItemResponseDTO } from '../../../api-services-v2';
import { ITEM_FIELD_NAMES } from '../../../display-name-mappings/item-names';
import { ORDER_FIELD_NAMES } from '../../../display-name-mappings/order-names';
import { DisplayItem } from '../../../models/display-item';
import { DisplayableOrder } from '../../../models/displayable-order';
import { TableColumn } from '../../../models/generic-table';
import { OrderDisplayData } from '../../../models/order-display-data';
import { OrderSubresourceResolverService } from '../../../services/order-subresource-resolver.service';
import { OrdersWrapperService } from '../../../services/wrapper-services/orders-wrapper.service';
import { AddressDisplayComponent } from '../address-display/address-display.component';

@Component({
  selector: 'app-order-main-information',
  imports: [MatDividerModule, MatButtonModule, AddressDisplayComponent],
  templateUrl: './order-main-information.component.html',
  styleUrl: './order-main-information.component.scss',
})
export class OrderMainInformationComponent implements OnInit, OnChanges {
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

  items!: DataSource<DisplayItem>;
  fetchedItems = signal<ItemResponseDTO[]>([]);

  totalPrice = signal(0);
  private currencyCode = 'EUR';

  totalPriceFormatted = computed(() => {
    const formatted = this.subresourceService.formatPrice(this.totalPrice(), this.currencyCode);
    return formatted + '\u00A0(brutto)';
  });

  totalNetPriceFormatted = computed(() => {
    const totalNetPrice = this.subresourceService.calculateTotalNetPrice(this.fetchedItems());
    const formatted = this.subresourceService.formatPrice(totalNetPrice, this.currencyCode);
    return formatted + '\u00A0(netto)';
  });

  totalQuantity = signal(0);
  totalQuantityFormatted = computed(() => {
    return this.totalQuantity() + '\u00A0Stück';
  });

  displayedColumns: TableColumn<DisplayItem>[] = [
    { id: 'name', label: ITEM_FIELD_NAMES['name'], footerContent: signal('Gesamt:') },
    { id: 'comment', label: ITEM_FIELD_NAMES['comment'] },
    { id: 'article_id', label: ITEM_FIELD_NAMES['article_id'] },
    { id: 'preferred_list', label: ITEM_FIELD_NAMES['preferred_list'] },
    { id: 'vat', label: ITEM_FIELD_NAMES['vat'] },
    { id: 'vat_type', label: ITEM_FIELD_NAMES['vat_type'] },
    { id: 'price_per_unit', label: ITEM_FIELD_NAMES['price_per_unit'] },
    {
      id: 'quantity',
      label: ITEM_FIELD_NAMES['quantity'],
      footerContent: this.totalQuantityFormatted,
    },
    {
      id: 'price_total',
      label: ITEM_FIELD_NAMES['price_total'],
      footerContent: this.totalPriceFormatted,
    },
  ];

  additionalInfoKeys: (keyof OrderDisplayData)[] = [
    'supplier_id',
    'customer_id',
    'quote_number',
    'quote_date',
    'quote_price',
    'quote_sign',
    'currency',
  ];

  constructor(
    private readonly ordersService: OrdersWrapperService,
    private readonly subresourceService: OrderSubresourceResolverService
  ) {}

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
    const orderWrapper = this.orderData();
    // If order data or order id is missing, clear the items and totals and return early.
    if (!orderWrapper?.order.id) {
      this.fetchedItems.set([]);
      this.items = new MatTableDataSource([]);
      this.totalQuantity.set(0);
      this.totalPrice.set(0);
      return;
    }

    const orderId: number = orderWrapper.order.id;
    this.ordersService.getOrderItems(orderId).then(items => {
      this.fetchedItems.set(items);

      this.currencyCode = orderWrapper.order.currency?.code ?? 'EUR';
      this.totalQuantity.set(this.subresourceService.calculateTotalQuantity(items));
      this.totalPrice.set(this.subresourceService.calculateTotalGrossPrice(this.fetchedItems()));

      this.items = new MatTableDataSource(items.map(item => this.createDisplayItem(item)));
    });
  }

  /** Converts an ItemResponseDTO into a DisplayItem for table display. */
  private createDisplayItem(item: ItemResponseDTO): DisplayItem {
    const quantity = item.quantity?.toString() + ' ' + (item.quantity_unit ?? '');

    return {
      name: item.name ?? '',
      comment: item.comment ?? '',
      article_id: item.article_id ?? '',
      preferred_list: (item.preferred_list ?? '') + (item.preferred_list_number ?? ''),
      vat: item.vat?.value?.toString() + '%',
      vat_type: item.vat_type ?? '',
      price_per_unit: this.subresourceService.formatPrice(
        item.price_per_unit ?? 0,
        this.currencyCode
      ),
      quantity: quantity.trim(),
      price_total: this.subresourceService.formatPrice(
        this.subresourceService.calculateTotalGrossPrice([item]),
        this.currencyCode
      ),
      tooltips: {
        vat: item.vat
          ? `MwSt.: ${item.vat.value}% (${item.vat.description})`
          : 'Keine MwSt. angegeben',
        preferred_list: this.subresourceService.formatPreferredList(item.preferred_list),
        price_total: `Gesamtbruttopreis für Menge: ${quantity.trim()}`,
      },
    };
  }

  /**
   * Heuristic to determine if the quote price is likely a gross price.
   * Compares the quote price to the calculated total gross price of items.
   */
  isQuotePriceProbablyBrutto(): boolean {
    const quotePrice = this.orderData().order['quote_price'];
    return Math.abs((quotePrice ?? 0) - this.totalPrice()) < 0.01;
  }

  /**
   * Heuristic to determine if the quote price is likely a net price.
   * Compares the quote price to the calculated total net price of items.
   */
  isQuotePriceProbablyNetto(): boolean {
    const quotePrice = this.orderData().order['quote_price'];
    const totalPrice = this.subresourceService.calculateTotalNetPrice(this.fetchedItems());
    return Math.abs((quotePrice ?? 0) - totalPrice) < 0.01;
  }
}
