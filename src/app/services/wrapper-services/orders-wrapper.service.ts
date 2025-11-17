import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom, Observable } from 'rxjs';
import { ApprovalResponseDTO, ItemResponseDTO, OrderRequestDTO, OrderResponseDTO, OrdersService, OrderStatus, OrderStatusHistoryResponseDTO, PagedOrderResponseDTO, QuotationResponseDTO } from '../../api-services-v2';
import { FilterRequestParams } from '../../models/filter/filter-request-params';

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
     * @param filters Filterparameter zur Einschränkung der Ergebnisse.
     * @param searchTerm Suchbegriff zur weiteren Filterung der Ergebnisse.
     * @returns PagedOrderResponseDTO OK
     */
  async getAllOrders(
    page: number = 0,
    size: number = 20,
    sort: Array<string> = [],
    filters?: FilterRequestParams,
    _searchTerm?: string
  ): Promise<PagedOrderResponseDTO> {
    return await lastValueFrom(this.ordersService.getAllOrders(
      page,
      size,
      sort,
      filters?.primaryCostCenters,
      filters?.bookingYears,
      filters?.createdAfter,
      filters?.createdBefore,
      filters?.ownerIds,
      filters?.statuses,
      filters?.quotePriceMin,
      filters?.quotePriceMax,
      filters?.deliveryPersonIds,
      filters?.invoicePersonIds,
      filters?.queriesPersonIds,
      filters?.customerIds,
      filters?.supplierIds,
      filters?.secondaryCostCenters,
      filters?.lastUpdatedTimeAfter,
      filters?.lastUpdatedTimeBefore,
      filters?.autoIndexMin,
      filters?.autoIndexMax
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
    return this.ordersService.exportOrderToFormula(Number.parseInt(orderId));
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
