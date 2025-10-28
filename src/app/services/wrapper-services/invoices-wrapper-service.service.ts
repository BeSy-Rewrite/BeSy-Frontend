import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { InvoiceRequestDTO, OrdersService } from '../../apiv2';

@Injectable({
  providedIn: 'root'
})
export class InvoicesWrapperServiceService {
  constructor(private readonly http: HttpClient, private readonly orderService: OrdersService) { }

  getDocumentsByOrderId(orderId: number) {
    return this.orderService.getInvoicesOfOrder(orderId);
  }

  downloadDocument(documentId: string) {
    return this.orderService.ordersInvoiceInvoiceIdDocumentGet(documentId);
    // Remove if above works return this.http.get(`${environment.apiUrl}/orders/invoice/${documentId}/document`, { responseType: 'blob' });
  }

  getDocumentPreview(documentId: string) {
    // Same as above return this.http.get(`${environment.apiUrl}/orders/invoice/${documentId}/document/preview`, { responseType: 'blob' });
    return this.orderService.ordersInvoiceInvoiceIdDocumentPreviewGet(documentId);
  }

  createInvoiceForOrder(orderId: number, invoice: InvoiceRequestDTO) {
    return this.orderService.createInvoice(orderId, invoice);
  }

  uploadInvoiceFile(invoiceId: string, file: File) {
    return this.orderService.uploadInvoiceDocument(invoiceId, file);
  }
}
