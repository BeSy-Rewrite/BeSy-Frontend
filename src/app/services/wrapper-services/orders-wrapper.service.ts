import { Injectable } from '@angular/core';
import { ItemResponseDTO, OrderRequestDTO, OrderResponseDTO, OrdersService, OrderStatus, PagedOrderResponseDTO, QuotationResponseDTO } from '../../api';

@Injectable({
  providedIn: 'root'
})
export class OrdersWrapperService {

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
    return await OrdersService.getAllOrders(
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

  async createOrder(request: OrderRequestDTO): Promise<OrderResponseDTO> {
    request.booking_year = request.booking_year?.slice(-2); // Nur die letzten zwei Ziffern übergeben
    return await OrdersService.createOrder(request);
  }

  async getOrderById(orderId: number): Promise<OrderResponseDTO> {
    return await OrdersService.getOrderById(orderId);
  }

  async deleteOrder(orderId: number): Promise<void> {
    return await OrdersService.deleteOrder(orderId);
  }

  async getOrderItems(orderId: string): Promise<ItemResponseDTO[]> {
    return await OrdersService.getOrderItems(orderId);
  }

  async createOrderItems(orderId: number, requestBody: any): Promise<any> {
    return await OrdersService.createOrderItems(orderId, requestBody);
  }

  async deleteItemOfOrder(orderId: number, itemId: number): Promise<void> {
    return await OrdersService.deleteItemOfOrder(orderId, itemId);
  }

  async getOrderQuotations(orderId: string): Promise<QuotationResponseDTO[]> {
    return await OrdersService.getOrderQuotations(orderId);
  }

  async createOrderQuotations(orderId: number, requestBody: any): Promise<any> {
    return await OrdersService.createOrderQuotations(orderId, requestBody);
  }

  async deleteQuotationOfOrder(orderId: number, quotationId: number): Promise<void> {
    return await OrdersService.deleteQuotationOfOrder(orderId, quotationId);
  }

  async exportOrderToFormula(orderId: string): Promise<any> {
    return await OrdersService.exportOrderToFormula(orderId);
  }
}
