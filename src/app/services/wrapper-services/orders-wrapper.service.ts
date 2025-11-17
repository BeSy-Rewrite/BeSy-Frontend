import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApprovalResponseDTO, ItemResponseDTO, OrderRequestDTO, OrderResponseDTO, OrdersService, OrderStatus, OrderStatusHistoryResponseDTO, PagedOrderResponseDTO, QuotationResponseDTO } from '../../api-services-v2';

@Injectable({
  providedIn: 'root'
})
export class OrdersWrapperService {

  constructor(private readonly http: HttpClient,
    private readonly ordersService: OrdersService
  ) { }

  /**
     * @param page Seitenzahl für die Paginierung (beginnend bei 0).
     * @param size Anzahl der Elemente pro Seite.
     * @param sort Sortierung der Ergebnisse. Mehrfache Sortierfelder möglich, z. B.  `sort=bookingYear,desc&sort=id,asc` sortiert zuerst nach `bookingYear` (absteigend), dann nach `id` (aufsteigend).
     *
     * @param primaryCostCenters Filtert nach IDs der primären Kostenstellen.
     * @param bookingYears Filtert nach den letzten zwei Ziffern der Jahreszahl der Buchung. Achtung, diese muss ein String sein, z.B. "25".
     * @param createdAfter Filtert nach Bestellungen, welche nach oder zu diesem Zeitpunkt erstellt wurden.
     * @param createdBefore Filtert nach Bestellungen, welche vor oder zu diesem Zeitpunkt erstellt wurden.
     * @param ownerIds Filtert nach IDs der Ersteller der Bestellung. Beinh
     * @param statuses Filtert nach dem Bestellstatus. Beinhaltet default-mäßig alle Bestellstatus.
     * @param quotePriceMin Filtert nach quotePriceMin.
     * @param quotePriceMax Filtert nach quotePriceMax.
     * @param deliveryPersonIds Filtert nach IDs der Besteller.
     * @param invoicePersonIds Filtert nach IDs invoicePersonIds.
     * @param queriesPersonIds Filtert nach IDs queriesPersonIds.
     * @param customerIds Filter nach Kundennummern.
     * @param supplierIds Filtert nach IDs der Lieferanten.
     * @param secondaryCostCenters Filtert nach IDs der sekundären Kostenstellen.
     * @param lastUpdatedTimeAfter Filtert nach Bestellungen, welche nach oder zu diesem Zeitpunkt bearbeitet wurden.
     * @param lastUpdatedTimeBefore Filtert nach Bestellungen, welche vor oder zu diesem Zeitpunkt bearbeitet wurden.
     * @returns PagedOrderResponseDTO OK
     * @throws ApiError
     */
  async getAllOrders(
    page?: number,
    size: number = 20,
    sort?: Array<string>,
    primaryCostCenters?: Array<string>,
    bookingYears?: Array<string>,
    createdAfter?: string,
    createdBefore?: string,
    ownerIds?: Array<number>,
    statuses?: Array<OrderStatus>,
    quotePriceMin?: number,
    quotePriceMax?: number,
    deliveryPersonIds?: Array<number>,
    invoicePersonIds?: Array<number>,
    queriesPersonIds?: Array<number>,
    customerIds?: Array<string>,
    supplierIds?: Array<number>,
    secondaryCostCenters?: Array<string>,
    lastUpdatedTimeAfter?: string,
    lastUpdatedTimeBefore?: string
  ): Promise<PagedOrderResponseDTO> {
    return await lastValueFrom(this.ordersService.getAllOrders(
      page,
      size,
      sort,
      primaryCostCenters,
      bookingYears,
      createdAfter,
      createdBefore,
      ownerIds,
      statuses,
      quotePriceMin,
      quotePriceMax,
      deliveryPersonIds,
      invoicePersonIds,
      queriesPersonIds,
      customerIds,
      supplierIds,
      secondaryCostCenters,
      lastUpdatedTimeAfter,
      lastUpdatedTimeBefore
    ));
  }

  async createOrder(request: OrderRequestDTO): Promise<OrderResponseDTO> {
    return await lastValueFrom(this.ordersService.createOrder(request));
  }

  async getOrderById(orderId: number): Promise<OrderResponseDTO> {
    return await lastValueFrom(this.ordersService.getOrderById(orderId));
  }

  async deleteOrder(orderId: number): Promise<void> {
    return await lastValueFrom(this.ordersService.deleteOrder(orderId));
  }

  async getOrderItems(orderId: string): Promise<ItemResponseDTO[]> {
    return await lastValueFrom(this.ordersService.getOrderItems(Number.parseInt(orderId)));
  }

  async createOrderItems(orderId: number, requestBody: any): Promise<any> {
    return await lastValueFrom(this.ordersService.createOrderItems(orderId, requestBody));
  }

  async deleteItemOfOrder(orderId: number, itemId: number): Promise<void> {
    return await lastValueFrom(this.ordersService.deleteItemOfOrder(orderId, itemId));
  }

  async getOrderQuotations(orderId: string): Promise<QuotationResponseDTO[]> {
    return await lastValueFrom(this.ordersService.getOrderQuotations(Number.parseInt(orderId)));
  }

  async createOrderQuotations(orderId: number, requestBody: any): Promise<any> {
    return await lastValueFrom(this.ordersService.createOrderQuotations(orderId, requestBody));
  }

  async deleteQuotationOfOrder(orderId: number, quotationId: number): Promise<void> {
    return await lastValueFrom(this.ordersService.deleteQuotationOfOrder(orderId, quotationId));
  }

  exportOrderToDocument(orderId: string): Observable<Blob> {
    return this.http.get(`${environment.apiUrl}/orders/${orderId}/export`, { responseType: 'blob' });
  }

  async getOrderApprovals(orderId: number): Promise<ApprovalResponseDTO> {
    return await lastValueFrom(this.ordersService.getOrderApprovals(orderId));
  }

  async getOrderStatusHistory(orderId: number): Promise<OrderStatusHistoryResponseDTO[]> {
    return await lastValueFrom(this.ordersService.getOrderStatusHistory(orderId));
  }

  async updateOrderState(orderId: number, newState: OrderStatus): Promise<OrderStatus> {
    return await lastValueFrom(this.ordersService.updateOrderStatus(orderId, newState));
  }
}
