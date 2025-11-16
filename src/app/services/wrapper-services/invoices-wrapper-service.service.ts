import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { InvoiceRequestDTO, InvoiceResponseDTO, OrdersService } from '../../api-services-v2';

@Injectable({
  providedIn: 'root'
})
export class InvoicesWrapperServiceService {
  constructor(private readonly ordersService: OrdersService) { }

  getDocumentsByOrderId(orderId: number) {
    return this.ordersService.getInvoicesOfOrder(orderId);
  }

  downloadDocument(documentId: string) {
    return this.ordersService.getInvoiceDocument(documentId);
  }

  getDocumentPreview(documentId: string) {
    return this.ordersService.getInvoiceDocumentPreview(documentId);
  }

  createInvoiceForOrder(orderId: number, invoice: InvoiceRequestDTO): Observable<InvoiceResponseDTO> {
    return this.ordersService.createInvoice(orderId, invoice);
  }

  uploadInvoiceFile(invoiceId: string, file: File): Observable<InvoiceResponseDTO> {
    return this.ordersService.uploadInvoiceDocument(invoiceId, file);
  }
}
