import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ItemRequestDTO, OrderRequestDTO, OrdersService, OrderStatus } from '../../apiv2';

@Injectable({
  providedIn: 'root'
})
export class OrdersWrapperService {

  constructor(private readonly http: HttpClient, private readonly ordersService: OrdersService) { }

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
  getAllOrders(
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
  ) {
    return this.ordersService.getAllOrders(
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
    );
  }

  createOrder(request: OrderRequestDTO) {
    return this.ordersService.createOrder(request);
  }

  getOrderById(orderId: number) {
    return this.ordersService.getOrderById(orderId);
  }

  deleteOrder(orderId: number) {
    return this.ordersService.deleteOrder(orderId);
  }

  getOrderItems(orderId: string) {
    return this.ordersService.getOrderItems(orderId);
  }

  createOrderItems(orderId: number, itemRequestDTOs: ItemRequestDTO[]) {
    return this.ordersService.createOrderItems(orderId, itemRequestDTOs);
  }

  deleteItemOfOrder(orderId: number, itemId: number) {
    return this.ordersService.deleteItemOfOrder(orderId, itemId);
  }

  getOrderQuotations(orderId: string) {
    return this.ordersService.getOrderQuotations(orderId);
  }

  createOrderQuotations(orderId: number, requestBody: any) {
    return this.ordersService.createOrderQuotations(orderId, requestBody);
  }

  deleteQuotationOfOrder(orderId: number, quotationId: number) {
    return this.ordersService.deleteQuotationOfOrder(orderId, quotationId);
  }

  exportOrderToDocument(orderId: string): Observable<Blob> {
    return this.ordersService.exportOrderToFormula(orderId);
    // TODO: see if needed return this.http.get(`${environment.apiUrl}/orders/${orderId}/export`, { responseType: 'blob' });
  }

  getOrderApprovals(orderId: number) {
    return this.ordersService.ordersOrderIdApprovalGet(orderId);
  }

  getOrderStatusHistory(orderId: number) {
    return this.ordersService.ordersOrderIdStatusHistoryGet(orderId);
  }

  putOrderState(orderId: number, newState: OrderStatus) {
    return this.ordersService.ordersOrderIdStatusPut(orderId, newState);
  }
}
