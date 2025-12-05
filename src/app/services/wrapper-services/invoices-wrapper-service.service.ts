import { Injectable } from '@angular/core';
import { from, mergeMap, Observable } from 'rxjs';
import { InvoiceRequestDTO, InvoiceResponseDTO, OrderResponseDTO, OrdersService } from '../../api-services-v2';
import { DocumentDTO } from '../../models/document-invoice';
import { OrdersWrapperService } from './orders-wrapper.service';

@Injectable({
  providedIn: 'root'
})
export class InvoicesWrapperServiceService {
  constructor(private readonly ordersService: OrdersService,
    private readonly ordersWrapperService: OrdersWrapperService
  ) { }

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

  createDocumentForOrder(orderId: number, document: DocumentDTO): Observable<InvoiceResponseDTO> {
    return from(this.ordersWrapperService.getOrderById(orderId)).pipe(
      mergeMap(order => this.createInvoiceForOrder(orderId,
        this.createInvoiceDTOFromDocumentDTO(order, document)))
    );
  }

  uploadInvoiceFile(invoiceId: string, file: File): Observable<InvoiceResponseDTO> {
    return this.ordersService.uploadInvoiceDocument(invoiceId, file);
  }

  createInvoiceDTOFromDocumentDTO(order: OrderResponseDTO, document: DocumentDTO): InvoiceRequestDTO {
    return {
      id: new Date().toISOString(),
      cost_center_id: order.primary_cost_center_id!,
      order_id: order.id!,
      price: 0,
      date: document.date.toISOString().split('T')[0],
      comment: document.comment,
      paperless_id: document.paperless_id
    };
  }
}
