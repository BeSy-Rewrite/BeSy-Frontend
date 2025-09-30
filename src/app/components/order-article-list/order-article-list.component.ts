import { DataSource } from '@angular/cdk/table';
import { Component, computed, input, OnInit, signal } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ItemResponseDTO } from '../../api';
import { ITEM_FIELD_LABELS } from '../../display-name-mappings/item-names';
import { ORDER_FIELD_LABELS } from '../../display-name-mappings/order-names';
import { DisplayItem } from '../../models/display-item';
import { DisplayableOrder } from '../../models/displayable-order';
import { TableColumn } from '../../models/generic-table';
import { OrderDisplayData } from '../../models/order-display-data';
import { OrderSubresourceResolverService } from '../../services/order-subresource-resolver.service';
import { OrdersWrapperService } from '../../services/wrapper-services/orders-wrapper.service';
import { GenericTableComponent } from '../generic-table/generic-table.component';


@Component({
  selector: 'app-order-article-list',
  imports: [
    GenericTableComponent
  ],
  templateUrl: './order-article-list.component.html',
  styleUrl: './order-article-list.component.scss'
})
export class OrderArticleListComponent implements OnInit {
  order = input.required<DisplayableOrder>();
  items!: DataSource<DisplayItem>;

  private totalPrice = 0;
  private currencyCode = 'EUR';

  totalPriceFormatted = computed(() => {
    const formatted = this.subresourceService.formatPrice(this.totalPrice, this.currencyCode);
    return formatted + '\u00A0(brutto)';
  });

  private totalQuantity = 0;
  totalQuantityFormatted = computed(() => {
    return this.totalQuantity + '\u00A0Stück';
  });

  orderFieldLabels = ORDER_FIELD_LABELS;
  itemFieldLabels = ITEM_FIELD_LABELS;

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

  private loadOrderItems(): void {
    this.ordersService.getOrderItems(this.order().order.id?.toString() ?? '').then(items => {
      this.items = new MatTableDataSource(items.map(item => this.createDisplayItem(item)));
    });
  }

  private createDisplayItem(item: ItemResponseDTO): DisplayItem {
    let preferredList = 'Keine bevorzugte Liste';
    if (item.preferred_list === ItemResponseDTO.preferred_list.RZ) {
      preferredList = 'RZ';
    } else if (item.preferred_list === ItemResponseDTO.preferred_list.TA) {
      preferredList = 'TA';
    }

    this.totalQuantity += item.quantity ?? 0;
    const quantity = item.quantity?.toString() + ' ' + (item.quantity_unit ?? '');

    this.currencyCode = this.order().order.currency?.code ?? 'EUR';
    let articleTotalPrice = (item.price_per_unit ?? 0) * (item.quantity ?? 0);
    if (item.vat_type === ItemResponseDTO.vat_type.NETTO) {
      articleTotalPrice = this.subresourceService.calculateGrossPrice(articleTotalPrice, item.vat?.value ?? 0);
    }
    this.totalPrice += articleTotalPrice;

    return {
      name: item.name ?? '',
      comment: item.comment ?? '',
      article_id: item.article_id ?? '',
      preferred_list: item.preferred_list ?? '' + (item.preferred_list_number ?? ''),
      vat: item.vat?.value?.toString() + '%',
      vat_type: item.vat_type ?? '',
      price_per_unit: this.subresourceService.formatPrice(item.price_per_unit ?? 0, this.currencyCode),
      quantity: quantity.trim(),
      price_total: this.subresourceService.formatPrice(articleTotalPrice, this.currencyCode),
      tooltips: {
        vat: item.vat ? `MwSt.: ${item.vat.value}% (${item.vat.description})` : 'Keine MwSt. angegeben',
        preferred_list: preferredList,
        price_total: `Gesamtbruttopreis für Menge: ${quantity.trim()}`
      }
    }
  }
}
