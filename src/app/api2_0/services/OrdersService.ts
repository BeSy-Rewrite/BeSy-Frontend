/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ItemResponseDTO } from '../models/ItemResponseDTO';
import type { OrderRequestDTO } from '../models/OrderRequestDTO';
import type { OrderResponseDTO } from '../models/OrderResponseDTO';
import type { OrderStatus } from '../models/OrderStatus';
import type { QuotationResponseDTO } from '../models/QuotationResponseDTO';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class OrdersService {
    /**
     * @param page Seitenzahl für die Paginierung (beginnend bei 0).
     * @param size Anzahl der Elemente pro Seite.
     * @param sort Sortierung der Ergebnisse. Mehrfache Sortierfelder möglich, z. B.  `sort=bookingYear,desc&sort=id,asc` sortiert zuerst nach `bookingYear` (absteigend), dann nach `id` (aufsteigend).
     *
     * @param primaryCostCenters Filtert nach IDs der primären Kostenstellen.
     * @param bookingYears Filtert nach den letzten zwei Ziffern der Jahreszahl der Buchung. Achtung, diese muss ein String sein, z.B. "25".
     * @param createdAfter Filtert nach Bestellungen, welche nach oder zu diesem Zeitpunkt erstellt wurden.
     * @param createdBefore Filtert nach Bestellungen, welche vor oder zu diesem Zeitpunkt erstellt wurden.
     * @param ownerIds Filtert nach IDs der Ersteller der Bestellung.
     * @param statuses Filtert nach dem Bestellstatus.
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
     * @returns OrderResponseDTO OK
     * @throws ApiError
     */
    public static getAllOrders(
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
        lastUpdatedTimeBefore?: string,
    ): CancelablePromise<Array<OrderResponseDTO>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/orders',
            query: {
                'page': page,
                'size': size,
                'sort': sort,
                'primaryCostCenters': primaryCostCenters,
                'bookingYears': bookingYears,
                'createdAfter': createdAfter,
                'createdBefore': createdBefore,
                'ownerIds': ownerIds,
                'statuses': statuses,
                'quotePriceMin': quotePriceMin,
                'quotePriceMax': quotePriceMax,
                'deliveryPersonIds': deliveryPersonIds,
                'invoicePersonIds': invoicePersonIds,
                'queriesPersonIds': queriesPersonIds,
                'customerIds': customerIds,
                'supplierIds': supplierIds,
                'secondaryCostCenters': secondaryCostCenters,
                'lastUpdatedTimeAfter': lastUpdatedTimeAfter,
                'lastUpdatedTimeBefore': lastUpdatedTimeBefore,
            },
        });
    }
    /**
     * Erstellt eine neue Bestellung und setzt den `status` auf "In Bearbeitung". `booking_year` & `primary_cost_center_id` sind verpflichtend, um eine neue Bestellung anlegen zu können.
     *
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
            errors: {
                409: `Verweis auf eine nicht existierende Entität.`,
                500: `Interner Serverfehler.`,
            },
        });
    }
    /**
     * @param orderId Die eindeutige ID der Bestellung, die abgerufen werden soll.
     * @returns OrderResponseDTO OK
     * @throws ApiError
     */
    public static getOrderById(
        orderId: number,
    ): CancelablePromise<OrderResponseDTO> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/orders/{order-id}',
            path: {
                'order-id': orderId,
            },
            errors: {
                404: `Bestellung nicht gefunden.`,
            },
        });
    }
    /**
     * Löscht eine bestehende Bestellung anhand der `order-id` (Soft Delete). Setzt den Status der Bestellung auf `DEL` (gelöscht). Es sind nur Bestellungen löschbar, deren status != `DEL` ist.
     *
     * @param orderId ID der zu löschenden Bestellung.
     * @returns void
     * @throws ApiError
     */
    public static deleteOrder(
        orderId: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/orders/{order-id}',
            path: {
                'order-id': orderId,
            },
            errors: {
                404: `Bestellung mit der angegebenen ID nicht gefunden.`,
                500: `Interner Serverfehler.`,
            },
        });
    }
    /**
     * @param orderId Die eindeutige ID der Bestellung, für welche die Artikel abgerufen werden sollen.
     * @returns ItemResponseDTO Erfolgreich abgerufene Artikel einer Bestellung.
     * @throws ApiError
     */
    public static getOrderItems(
        orderId: string,
    ): CancelablePromise<Array<ItemResponseDTO>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/orders/{order-id}/items',
            path: {
                'order-id': orderId,
            },
            errors: {
                404: `Bestellung nicht gefunden.`,
            },
        });
    }
    /**
     * Erstellt neue Artikel einer Bestellung.
     *
     * @param orderId Die eindeutige ID der Bestellung, für welche neue Artikel angelegt werden sollen.
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static createOrderItems(
        orderId: number,
        requestBody: any,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/orders/{order-id}/items',
            path: {
                'order-id': orderId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Bestellung nicht gefunden.`,
                409: `Zugehöriger Artikel mit Artikelnummer \`article_id\` existiert bereits.`,
            },
        });
    }
    /**
     * Löscht einen Artikel einer bestehenden Bestellung (`order-id`) anhand der `item-id` (Hard Delete).
     *
     * @param orderId ID der Bestellung, deren Artikel gelöscht werden soll.
     * @param itemId ID des Artikels, der gelöscht werden soll.
     * @returns void
     * @throws ApiError
     */
    public static deleteItemOfOrder(
        orderId: number,
        itemId: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/orders/{order-id}/items/{item-id}',
            path: {
                'order-id': orderId,
                'item-id': itemId,
            },
            errors: {
                404: `Bestellung nicht gefunden. Artikel nicht gefunden.`,
                500: `Interner Serverfehler.`,
            },
        });
    }
    /**
     * @param orderId Die eindeutige ID der Bestellung, für welche die Vergleichsangebote abgerufen werden sollen.
     * @returns QuotationResponseDTO Erfolgreich abgerufene Vergleichsangebote einer Bestellung.
     * @throws ApiError
     */
    public static getOrderQuotations(
        orderId: string,
    ): CancelablePromise<Array<QuotationResponseDTO>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/orders/{order-id}/quotations',
            path: {
                'order-id': orderId,
            },
            errors: {
                404: `Bestellung nicht gefunden.`,
            },
        });
    }
    /**
     * Erstellt neue Vergleichsangebote einer Bestellung.
     *
     * @param orderId Die eindeutige ID der Bestellung, für welche neue Vergleichsangebote angelegt werden sollen.
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static createOrderQuotations(
        orderId: number,
        requestBody: any,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/orders/{order-id}/quotations',
            path: {
                'order-id': orderId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Bestellung nicht gefunden.`,
                409: `Zugehöriges Vergleichsangebot mit dem Index \`index\` existiert bereits.`,
            },
        });
    }
    /**
     * Löscht ein Vergleichsangebot einer bestehenden Bestellung (`order-id`) anhand der `quotation-id` (Hard Delete).
     *
     * @param orderId ID der Bestellung, deren Vergleichsartikel gelöscht werden soll.
     * @param quotationId ID des Vergleichsartikel, der gelöscht werden soll.
     * @returns void
     * @throws ApiError
     */
    public static deleteQuotationOfOrder(
        orderId: number,
        quotationId: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/orders/{order-id}/quotations/{quotation-id}',
            path: {
                'order-id': orderId,
                'quotation-id': quotationId,
            },
            errors: {
                404: `Bestellung nicht gefunden. Vergleichsartikel nicht gefunden.`,
                500: `Interner Serverfehler.`,
            },
        });
    }
    /**
     * @param orderId Die eindeutige ID der Bestellung, für welche die Bestellung als PDF ins Bestellformular exportiert wird.
     * @returns any Successfully retrieved PDF formula for the order.
     * @throws ApiError
     */
    public static exportOrderToFormula(
        orderId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/orders/{order-id}/export',
            path: {
                'order-id': orderId,
            },
            errors: {
                404: `Bestellung nicht gefunden.`,
            },
        });
    }
}
