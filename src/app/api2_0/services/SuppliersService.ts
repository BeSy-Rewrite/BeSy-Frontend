/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CustomerIdRequestDTO } from '../models/request-dtos/CustomerIdRequestDTO';
import type { CustomerIdResponseDTO } from '../models/response-dtos/CustomerIdResponseDTO';
import type { SupplierRequestDTO } from '../models/request-dtos/SupplierRequestDTO';
import type { SupplierResponseDTO } from '../models/response-dtos/SupplierResponseDTO';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SuppliersService {
    /**
     * @returns SupplierResponseDTO List of suppliers
     * @throws ApiError
     */
    public static getAllSuppliers(): CancelablePromise<Array<SupplierResponseDTO>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/suppliers',
        });
    }
    /**
     * @param requestBody
     * @returns SupplierResponseDTO Lieferant erfolgreich erstellt.
     * @throws ApiError
     */
    public static createSupplier(
        requestBody: SupplierRequestDTO,
    ): CancelablePromise<SupplierResponseDTO> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/suppliers',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Ungültige Eingabe(n).`,
                500: `Interner Serverfehler.`,
            },
        });
    }
    /**
     * @param supplierId Die eindeutige ID des Lieferanten, welcher abgerufen werden soll.
     * @returns SupplierResponseDTO Lieferant gefunden.
     * @throws ApiError
     */
    public static getSupplierById(
        supplierId: number,
    ): CancelablePromise<SupplierResponseDTO> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/suppliers/{supplier-id}',
            path: {
                'supplier-id': supplierId,
            },
            errors: {
                404: `Lieferant nicht gefunden.`,
            },
        });
    }
    /**
     * @param supplierId Die eindeutige ID des Lieferanten, für welchen die Kundennummern abgerufen werden sollen.
     * @returns CustomerIdResponseDTO Liste der Kundennummern eines Lieferanten.
     * @throws ApiError
     */
    public static getCustomerIdsOfOrder(
        supplierId: number,
    ): CancelablePromise<Array<CustomerIdResponseDTO>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/suppliers/{supplier-id}/customer_ids',
            path: {
                'supplier-id': supplierId,
            },
            errors: {
                404: `Lieferant nicht gefunden.`,
            },
        });
    }
    /**
     * @param supplierId Die eindeutige ID des Lieferanten, für welchen die Kundennummern erstellt werden soll.
     * @param requestBody
     * @returns CustomerIdResponseDTO Kundennummer erfolgreich erstellt.
     * @throws ApiError
     */
    public static createSupplierCustomerId(
        supplierId: number,
        requestBody: CustomerIdRequestDTO,
    ): CancelablePromise<CustomerIdResponseDTO> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/suppliers/{supplier-id}/customer_ids',
            path: {
                'supplier-id': supplierId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Lieferant nicht gefunden.`,
                409: `Lieferantennummer bereits vorhanden für diesen Lieferanten.
                Verweis auf eine nicht existierende Entität.
                `,
                500: `Interner Serverfehler.`,
            },
        });
    }
}
