/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ItemResponseDTO } from '../models/response-dtos/ItemResponseDTO';
import type { OrderPatchRequestDTO } from '../models/request-dtos/OrderPatchRequestDTO';
import type { OrderRequestDTO } from '../models/request-dtos/OrderRequestDTO';
import type { OrderResponseDTO } from '../models/response-dtos/OrderResponseDTO';
import type { QuotationResponseDTO } from '../models/response-dtos/QuotationResponseDTO';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class OrdersService {
    /**
     * @param ownerId Filter orders by the owner's ID.
     * @param page Page number of the results to retrieve.
     * @param size Number of orders to return per page.
     * @returns OrderResponseDTO OK
     * @throws ApiError
     */
    public static getAllOrders(
        ownerId?: string,
        page?: number,
        size?: number,
    ): CancelablePromise<Array<OrderResponseDTO>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/orders',
            query: {
                'owner_id': ownerId,
                'page': page,
                'size': size,
            },
        });
    }
    /**
     * @param requestBody
     * @returns OrderResponseDTO OK
     * @throws ApiError
     */
    public static createOrder(
        requestBody: OrderRequestDTO,
    ): CancelablePromise<OrderResponseDTO> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/orders',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Partially update an order.
     * @param requestBody
     * @returns OrderResponseDTO OK
     * @throws ApiError
     */
    public static updateMultipleOrders(
        requestBody: OrderPatchRequestDTO,
    ): CancelablePromise<OrderResponseDTO> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/orders',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param orderId ID of the order to retrieve items for.
     * @returns ItemResponseDTO Successfully retrieved items for the order.
     * @throws ApiError
     */
    public static getOrderItems(
        orderId: string,
    ): CancelablePromise<Array<ItemResponseDTO>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/orders/{order_id}/items',
            path: {
                'order_id': orderId,
            },
            errors: {
                404: `Order not found.`,
            },
        });
    }
    /**
     * @param orderId ID of the order to retrieve quotations for.
     * @returns QuotationResponseDTO Successfully retrieved quotations for the order.
     * @throws ApiError
     */
    public static getOrderQuotations(
        orderId: string,
    ): CancelablePromise<Array<QuotationResponseDTO>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/orders/{order_id}/quotations',
            path: {
                'order_id': orderId,
            },
            errors: {
                404: `Order not found.`,
            },
        });
    }
}
