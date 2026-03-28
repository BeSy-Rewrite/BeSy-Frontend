import { DataSource } from '@angular/cdk/table';
import { Component, input, OnChanges, OnInit, signal } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { InvoiceResponseDTO, OrderResponseDTO } from '../../../api-services-v2';
import { INVOICE_FIELD_NAMES } from '../../../display-name-mappings/invoice-names';
import { TableColumn } from '../../../models/generic-table';
import { OrderSubresourceResolverService } from '../../../services/order-subresource-resolver.service';
import { InvoicesWrapperServiceService } from '../../../services/wrapper-services/invoices-wrapper-service.service';
import { GenericTableComponent } from '../../generic-table/generic-table.component';

type LegacyInvoiceDisplayData = Omit<InvoiceResponseDTO, 'price'> & {
  price: number | string;
};

@Component({
  selector: 'app-legacy-invoice-display',
  imports: [GenericTableComponent],
  templateUrl: './legacy-invoice-display.component.html',
  styleUrl: './legacy-invoice-display.component.scss',
})
export class LegacyInvoiceDisplayComponent implements OnInit, OnChanges {
  order = input.required<OrderResponseDTO>();
  columns: TableColumn<LegacyInvoiceDisplayData>[] = [
    { id: 'id', label: INVOICE_FIELD_NAMES.id },
    { id: 'comment', label: INVOICE_FIELD_NAMES.comment },
    { id: 'cost_center_id', label: INVOICE_FIELD_NAMES.cost_center_id },
    { id: 'price', label: INVOICE_FIELD_NAMES.price },
    { id: 'date', label: INVOICE_FIELD_NAMES.date },
    { id: 'created_date', label: INVOICE_FIELD_NAMES.created_date },
    { id: 'order_id', label: INVOICE_FIELD_NAMES.order_id },
  ];
  dataSource: DataSource<LegacyInvoiceDisplayData> =
    new MatTableDataSource<LegacyInvoiceDisplayData>([]);
  isInitialized = false;
  isEmpty = signal(true);

  subscription: Subscription | null = null;

  constructor(
    private readonly invoiceService: InvoicesWrapperServiceService,
    private readonly resourceResolver: OrderSubresourceResolverService
  ) { }

  ngOnInit() {
    this.setupDataSource();
    this.isInitialized = true;
  }
  ngOnChanges() {
    if (this.isInitialized) {
      this.setupDataSource();
    }
  }
  setupDataSource() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.subscription = this.invoiceService.getLegacyInvoicesByOrderId(this.order().id!).subscribe(invoices => {
      const formattedInvoices = invoices.map(invoice => ({
        ...invoice,
        price:
          this.resourceResolver.formatPrice(invoice.price, this.order().currency?.code ?? 'EUR') ??
          'Unbekannt',
      }));
      this.dataSource = new MatTableDataSource<LegacyInvoiceDisplayData>(formattedInvoices);
      this.isEmpty.set(formattedInvoices.length <= 0);
    });
  }
}
