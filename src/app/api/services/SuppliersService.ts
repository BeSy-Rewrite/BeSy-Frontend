/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AddressResponseDTO } from '../models/AddressResponseDTO';
import type { CustomerIdRequestDTO } from '../models/CustomerIdRequestDTO';
import type { CustomerIdResponseDTO } from '../models/CustomerIdResponseDTO';
import type { SupplierRequestDTO } from '../models/SupplierRequestDTO';
import type { SupplierResponseDTO } from '../models/SupplierResponseDTO';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SuppliersService {
    /**
     * @returns SupplierResponseDTO Liste von Lieferanten
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
     * @param supplierId Die eindeutige ID des Lieferanten, welcher aktualisiert werden soll.
     * @param requestBody
     * @returns SupplierResponseDTO Lieferant gefunden.
     * @throws ApiError
     */
    public static updateSupplierById(
        supplierId: number,
        requestBody: SupplierRequestDTO,
    ): CancelablePromise<SupplierResponseDTO> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/suppliers/{supplier-id}',
            path: {
                'supplier-id': supplierId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Lieferant nicht gefunden.`,
                500: `Interner Serverfehler.`,
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
    /**
     * @deprecated
     * @returns AddressResponseDTO Liste aller Adressen.
     * @throws ApiError
     */
    public static getSuppliersAddresses(): CancelablePromise<Array<AddressResponseDTO>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/suppliers/addresses',
        });
    }
    /**
     * @param supplierId
     * @returns AddressResponseDTO Adresse des Lieferanten.
     * @throws ApiError
     */
    public static getSuppliersAddress(
        supplierId: number,
    ): CancelablePromise<AddressResponseDTO> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/suppliers/{supplier-id}/address',
            path: {
                'supplier-id': supplierId,
            },
            errors: {
                404: `Lieferant nicht gefunden. Dieser Lieferant besitzt keine Adresse.`,
            },
        });
    }
}
