import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { from } from 'rxjs';
import { environment } from '../../../environments/environment';
import { InvoiceResponseDTO, OrdersService } from '../../api';

@Injectable({
  providedIn: 'root'
})
export class InvoicesWrapperServiceService {
  constructor(private readonly http: HttpClient) { }

  getDocumentsByOrderId(orderId: number) {
    return this.http.get<InvoiceResponseDTO[]>(`${environment.apiUrl}/orders/${orderId}/invoices`);
  }

  downloadDocument(documentId: string) {
    return from(OrdersService.getOrdersInvoiceDocument(documentId));
  }
}
