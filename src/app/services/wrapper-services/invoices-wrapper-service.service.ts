import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { InvoiceResponseDTO } from '../../api';
import { InvoiceRequestDTO } from '../../components/documents/document-upload/document-upload.component';

@Injectable({
  providedIn: 'root'
})
export class InvoicesWrapperServiceService {
  constructor(private readonly http: HttpClient) { }

  getDocumentsByOrderId(orderId: number) {
    return this.http.get<InvoiceResponseDTO[]>(`${environment.apiUrl}/orders/${orderId}/invoices`);
  }

  // Generated API call doesn't work correctly for downloading documents currently, hence a custom implementation
  downloadDocument(documentId: string) {
    return this.http.get(`${environment.apiUrl}/orders/invoice/${documentId}/document`, { responseType: 'blob' });
  }

  getDocumentPreview(documentId: string) {
    return this.http.get(`${environment.apiUrl}/orders/invoice/${documentId}/document/preview`, { responseType: 'blob' });
  }

  createInvoiceForOrder(orderId: number, invoice: InvoiceRequestDTO): Observable<InvoiceResponseDTO> {
    return this.http.post<InvoiceResponseDTO>(`${environment.apiUrl}/orders/${orderId}/invoices`, invoice);
  }

  uploadInvoiceFile(invoiceId: string, file: File): Observable<InvoiceResponseDTO> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<InvoiceResponseDTO>(`${environment.apiUrl}/orders/invoice/${invoiceId}/document`, formData);
  }
}
