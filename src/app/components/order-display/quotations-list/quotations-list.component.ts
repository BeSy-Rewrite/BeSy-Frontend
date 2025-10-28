import { DataSource } from '@angular/cdk/table';
import { Component, input, OnChanges, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { QuotationResponseDTO } from '../../../apiv2';
import { QUOTATION_FIELD_NAMES } from '../../../display-name-mappings/quotation-names';
import { DisplayQuotation } from '../../../models/display-quotation';
import { TableColumn } from '../../../models/generic-table';
import { OrdersWrapperService } from '../../../services/wrapper-services/orders-wrapper.service';
import { GenericTableComponent } from "../../generic-table/generic-table.component";

@Component({
  selector: 'app-quotations-list',
  imports: [
    GenericTableComponent
  ],
  templateUrl: './quotations-list.component.html',
  styleUrl: './quotations-list.component.scss'
})
export class QuotationsListComponent implements OnInit, OnChanges {
  isInitialized = false;

  quotations: QuotationResponseDTO[] = [];
  quotationFieldNames = QUOTATION_FIELD_NAMES;

  quotationsDataSource!: DataSource<DisplayQuotation>;
  displayedColumns: TableColumn<DisplayQuotation>[] = [
    { id: 'index', label: this.quotationFieldNames['index'] },
    { id: 'quote_date', label: this.quotationFieldNames['quote_date'] },
    { id: 'price', label: this.quotationFieldNames['price'] },
    { id: 'company_name', label: this.quotationFieldNames['company_name'] },
    { id: 'company_city', label: this.quotationFieldNames['company_city'] }
  ];

  orderId = input.required<number>();

  constructor(private readonly ordersService: OrdersWrapperService) { }

  ngOnInit() {
    this.isInitialized = true;
    this.setup();
  }

  ngOnChanges() {
    if (this.isInitialized)
      this.setup();
  }

  setup() {
    this.ordersService.getOrderQuotations(this.orderId().toString()).subscribe(quotations => {
      this.quotations = quotations;

      this.quotationsDataSource = new MatTableDataSource<DisplayQuotation>(
        quotations.map(q => this.formatQuotation(q))
      );
    });
  }

  formatQuotation(quotation: QuotationResponseDTO): DisplayQuotation {
    const date = new Date(quotation.quote_date ?? '-');
    const formattedDate = date.toLocaleDateString('de-DE',
      {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }
    );

    return {
      index: quotation.index ?? 0,
      quote_date: formattedDate,
      price: (quotation.price?.toString() ?? '0') + ' €',
      company_name: quotation.company_name ?? '-',
      company_city: quotation.company_city ?? '-'
    };
  }

}
