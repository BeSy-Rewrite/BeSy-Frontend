import { DataSource } from '@angular/cdk/table';
import { Component, computed, input, OnChanges, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from "@angular/material/divider";
import { MatTableDataSource } from '@angular/material/table';
import { ItemResponseDTO, OrderResponseDTO } from '../../../api';
import { ITEM_FIELD_NAMES } from '../../../display-name-mappings/item-names';
import { DisplayItem } from '../../../models/display-item';
import { TableColumn } from '../../../models/generic-table';
import { OrderSubresourceResolverService } from '../../../services/order-subresource-resolver.service';
import { OrdersWrapperService } from '../../../services/wrapper-services/orders-wrapper.service';
import { GenericTableComponent } from '../../generic-table/generic-table.component';

@Component({
  selector: 'app-order-article-list',
  imports: [
    MatDividerModule,
    MatButtonModule,
    GenericTableComponent
  ],
  templateUrl: './order-article-list.component.html',
  styleUrl: './order-article-list.component.scss'
})
export class OrderArticleListComponent implements OnInit, OnChanges {

  /** The order data to display the items for */
  order = input.required<OrderResponseDTO>();

  itemFieldLabels = ITEM_FIELD_NAMES;

  items!: DataSource<DisplayItem>;
  fetchedItems = signal<ItemResponseDTO[]>([]);

  private currencyCode = 'EUR';
  totalPrice = signal(0);
  totalPriceFormatted = computed(() => {
    const formatted = this.subresourceService.formatPrice(this.totalPrice(), this.currencyCode);
    return formatted + '\u00A0(brutto)';
  });

  totalQuantity = signal(0);
  totalQuantityFormatted = computed(() => {
    return this.totalQuantity() + '\u00A0Stück';
  });

  displayedColumns: TableColumn<DisplayItem>[] = [
    { id: 'name', label: this.itemFieldLabels['name'], footerContent: signal('Gesamt:') },
    { id: 'comment', label: this.itemFieldLabels['comment'] },
    { id: 'article_id', label: this.itemFieldLabels['article_id'] },
    { id: 'preferred_list', label: this.itemFieldLabels['preferred_list'] },
    { id: 'vat', label: this.itemFieldLabels['vat'] },
    { id: 'vat_type', label: this.itemFieldLabels['vat_type'] },
    { id: 'price_per_unit', label: this.itemFieldLabels['price_per_unit'] },
    { id: 'quantity', label: this.itemFieldLabels['quantity'], footerContent: this.totalQuantityFormatted },
    { id: 'price_total', label: this.itemFieldLabels['price_total'], footerContent: this.totalPriceFormatted },
  ];

  constructor(private readonly ordersService: OrdersWrapperService,
    private readonly subresourceService: OrderSubresourceResolverService
  ) { }

  ngOnInit(): void {
    this.loadOrderItems();
  }

  ngOnChanges(): void {
    if (this.order()) {
      this.loadOrderItems();
    }
  }

  /** Loads the items for the current order and computes totals. */
  private loadOrderItems(): void {
    this.ordersService.getOrderItems(this.order().id).then(items => {
      this.fetchedItems.set(items);

      this.currencyCode = this.order().currency?.code ?? 'EUR';
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
      price_per_unit: this.subresourceService.formatPrice(item.price_per_unit ?? 0, this.currencyCode),
      quantity: quantity.trim(),
      price_total: this.subresourceService.formatPrice(this.subresourceService.calculateTotalGrossPrice([item]), this.currencyCode),
      tooltips: {
        vat: item.vat ? `MwSt.: ${item.vat.value}% (${item.vat.description})` : 'Keine MwSt. angegeben',
        preferred_list: this.subresourceService.formatPreferredList(item.preferred_list),
        price_total: `Gesamtbruttopreis für Menge: ${quantity.trim()}`
      }
    }
  }
}
