import { Injectable } from '@angular/core';
import { ItemResponseDTO, OrderRequestDTO, OrderResponseDTO, OrdersService, OrderStatus, PagedOrderResponseDTO, QuotationResponseDTO } from '../../api';

@Injectable({
  providedIn: 'root'
})
export class OrdersWrapperService {

  constructor() {}

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
  ): Promise<PagedOrderResponseDTO[]> {
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
