/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApprovalRequestDTO } from '../models/ApprovalRequestDTO';
import type { ApprovalResponseDTO } from '../models/ApprovalResponseDTO';
import type { InvoiceResponseDTO } from '../models/InvoiceResponseDTO';
import type { ItemResponseDTO } from '../models/ItemResponseDTO';
import type { OrderRequestDTO } from '../models/OrderRequestDTO';
import type { OrderResponseDTO } from '../models/OrderResponseDTO';
import type { OrderStatus } from '../models/OrderStatus';
import type { OrderStatusHistoryResponseDTO } from '../models/OrderStatusHistoryResponseDTO';
import type { PagedOrderResponseDTO } from '../models/PagedOrderResponseDTO';
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
    ): CancelablePromise<Array<PagedOrderResponseDTO>> {
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
     * Erstellt eine neue Bestellung und setzt den Bestellstatus (`status`) auf "In Bearbeitung" (`IN_PROGRESS`). Nur in diesem Bestellstatus ist das Bearbeiten einer Bestellung möglich.
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
     * Aktualisiert eine Bestellung. Nur nicht-leere Felder im Request-Body werden übernommen. Nur möglich, wenn sich die Bestellung im Bestellstatus (`status`) "In Bearbeitung" (`IN_PROGRESS`) befindet.
     * @param orderId Die eindeutige ID der Bestellung, die verändert werden soll.
     * @param requestBody
     * @returns OrderResponseDTO Bestellung erfolgreich aktualisiert.
     * @throws ApiError
     */
    public static updateOrder(
        orderId: number,
        requestBody: OrderRequestDTO,
    ): CancelablePromise<OrderResponseDTO> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/orders/{order-id}',
            path: {
                'order-id': orderId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bestellstatus befindet sich nicht in Bearbeitung (\`IN_PROGRESS\`)!`,
                404: `Bestellung nicht gefunden.`,
                409: `Verweis auf eine nicht existierende Entität.`,
                500: `Interner Serverfehler.`,
            },
        });
    }
    /**
     * Löscht eine bestehende Bestellung anhand der `order-id` (Soft Delete). Setzt den Bestelltatus (`order_status`) auf gelöscht (`DELETED`).
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
                400: `Bestellstatus befindet sich nicht in gültigem Bestellstatus!`,
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
                400: `Bestellstatus befindet sich nicht in Bearbeitung (\`IN_PROGRESS\`)!`,
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
                400: `Bestellstatus befindet sich nicht in Bearbeitung (\`IN_PROGRESS\`)!`,
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
                400: `Bestellstatus befindet sich nicht in Bearbeitung (\`IN_PROGRESS\`)!`,
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
                400: `Bestellstatus befindet sich nicht in Bearbeitung (\`IN_PROGRESS\`)!`,
                404: `Bestellung nicht gefunden. Vergleichsartikel nicht gefunden.`,
                500: `Interner Serverfehler.`,
            },
        });
    }
    /**
     * Gibt das vollständige PDF-Dokument zur angegebenen Rechnung zurück.
     * @param invoiceId ID der Rechnung, für die das PDF heruntergeladen wird.
     * @returns binary PDF erfolgreich zurückgegeben
     * @throws ApiError
     */
    public static getOrdersInvoiceDocument(
        invoiceId: string,
    ): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/orders/invoice/{invoice-id}/document',
            path: {
                'invoice-id': invoiceId,
            },
            errors: {
                404: `Rechnung nicht gefunden.`,
                500: `Interner Serverfehler.`,
            },
        });
    }
    /**
     * Lädt eine PDF-Datei hoch und verknüpft sie nach der Verarbeitung mit der angegebenen Rechnung. Jede Rechnung kann ausschließlich mit einem PDF-Dokument verküpft werden.
     *
     * @param invoiceId Die ID der Rechnung, mit der das Dokument verknüpft werden soll
     * @param formData
     * @returns InvoiceResponseDTO Dokument erfolgreich hochgeladen und mit der Rechnung verknüpft
     * @throws ApiError
     */
    public static uploadInvoiceDocument(
        invoiceId: string,
        formData: {
            /**
             * Die hochzuladende PDF-Datei
             */
            file?: Blob;
        },
    ): CancelablePromise<InvoiceResponseDTO> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/orders/invoice/{invoice-id}/document',
            path: {
                'invoice-id': invoiceId,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                400: `Diese Rechnung besitzt bereits ein verknüpftes Dokument mit der id \`paperless_id\`.`,
                404: `Rechnung nicht gefunden.`,
                500: `Fehler beim Hochladen des Dokumentes. Interner Serverfehler.`,
            },
        });
    }
    /**
     * Gibt eine Vorschau des PDF-Dokuments als IMG-Datei zur angegebenen Rechnung zurück.
     * @param invoiceId ID der Rechnung, für die die PDF-Vorschau abgerufen wird.
     * @returns binary PDF-Vorschau erfolgreich zurückgegeben
     * @throws ApiError
     */
    public static getOrdersInvoiceDocumentPreview(
        invoiceId: string,
    ): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/orders/invoice/{invoice-id}/document/preview',
            path: {
                'invoice-id': invoiceId,
            },
            errors: {
                404: `Rechnung nicht gefunden.`,
                500: `Interner Serverfehler.`,
            },
        });
    }
    /**
     * Gibt die Zustimmungen für die angegebene Bestellung zurück.
     * @param orderId ID der Bestellung, deren Zustimmungen abgerufen wird.
     * @returns ApprovalResponseDTO Zustimmungen erfolgreich abgerufen.
     * @throws ApiError
     */
    public static getOrdersApproval(
        orderId: number,
    ): CancelablePromise<ApprovalResponseDTO> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/orders/{order-id}/approval',
            path: {
                'order-id': orderId,
            },
            errors: {
                404: `Bestellung nicht gefunden.`,
                500: `Interner Serverfehler.`,
            },
        });
    }
    /**
     * Aktualisiert Felder der Zustimmungen für die angegebene Bestellung. Nur nicht-leere Felder im Request-Body werden übernommen.
     * @param orderId ID der Bestellung, deren Zustimmungen aktualisiert wird.
     * @param requestBody
     * @returns ApprovalResponseDTO Approval successfully updated
     * @throws ApiError
     */
    public static patchOrdersApproval(
        orderId: number,
        requestBody: ApprovalRequestDTO,
    ): CancelablePromise<ApprovalResponseDTO> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/orders/{order-id}/approval',
            path: {
                'order-id': orderId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bestellstatus befindet sich nicht auf fertiggestellt (\`COMPLETED\`)!`,
                404: `Bestellung nicht gefunden.`,
                500: `Interner Serverfehler.`,
            },
        });
    }
    /**
     * Gibt eine Map zurück, die jedem OrderStatus die erlaubten nächsten OrderStatus-Werte zuordnet.
     * @returns OrderStatus Erfolgreiche Abfrage der Order-Status-Matrix.
     * @throws ApiError
     */
    public static getOrdersStatuses(): CancelablePromise<Record<string, Array<OrderStatus>>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/orders/statuses',
        });
    }
    /**
     * Aktualisiert den Bestellstatus (`status`) mit der angegebenen `order-id`.   Wirft einen Fehler, wenn der neue Status `DELETED` ist — bitte stattdessen den DELETE-Endpunkt verwenden.
     *
     * @param orderId ID der Bestellung, deren Bestellstatus aktualisiert wird.
     * @param requestBody
     * @returns OrderStatus Bestellstatus erfolgreich aktualisiert.
     * @throws ApiError
     */
    public static putOrdersStatus(
        orderId: number,
        requestBody: OrderStatus,
    ): CancelablePromise<OrderStatus> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/orders/{order-id}/status',
            path: {
                'order-id': orderId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Löschen nicht erlaubt, nutze DELETE endpoint! Ungültiger Statusübergang von \`old_status\` zu \`new_status\`. primary_cost_center_id darf nicht null sein.`,
            },
        });
    }
    /**
     * Gibt eine Liste des Verlaufes des Bestellstatus einer Bestellung zurück.
     * @param orderId ID der Bestellung, deren Bestellstatus-Historie abgerufen werden soll.
     * @returns OrderStatusHistoryResponseDTO Liste des Statusverlaufs erfolgreich abgerufen
     * @throws ApiError
     */
    public static getOrdersStatusHistory(
        orderId: number,
    ): CancelablePromise<Array<OrderStatusHistoryResponseDTO>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/orders/{order-id}/status/history',
            path: {
                'order-id': orderId,
            },
            errors: {
                404: `Bestellung nicht gefunden.`,
            },
        });
    }
    /**
     * @param orderId Die eindeutige ID der Bestellung, für die das Bestellformular als PDF exportiert wird.
     * @returns any PDF-Formular der Bestellung erfolgreich abgerufen.
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
