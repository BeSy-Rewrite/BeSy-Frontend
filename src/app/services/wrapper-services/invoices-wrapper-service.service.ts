import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { InvoiceResponseDTO } from '../../api';

@Injectable({
  providedIn: 'root'
})
export class InvoicesWrapperServiceService {
  constructor(private readonly http: HttpClient) { }

  getDocumentsByOrderId(orderId: number) {
    return this.http.get<InvoiceResponseDTO[]>(`${environment.apiUrl}/orders/${orderId}/invoices`);
  }

  // Generated API call doesnt work correctly for downloading documents currently, hence a custom implementation
  downloadDocument(documentId: string) {
    return this.http.get(`${environment.apiUrl}/orders/invoice/${documentId}/document`, { responseType: 'blob' });
  }

  getDocumentPreview(documentId: string) {
    return this.http.get(`${environment.apiUrl}/orders/invoice/${documentId}/document/preview`, { responseType: 'blob' });
  }
}
