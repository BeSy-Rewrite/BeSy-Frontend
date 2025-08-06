/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SupplierRequestDTO } from '../models/request-dtos/SupplierRequestDTO';
import type { SupplierResponseDTO } from '../models/response-dtos/SupplierResponseDTO';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SuppliersService {
    /**
     * Get all suppliers
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
     * Create a new supplier
     * @param requestBody
     * @returns SupplierResponseDTO Supplier successfully created
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
                400: `Invalid input`,
            },
        });
    }
    /**
     * Get a supplier by ID
     * @param id ID of the supplier to retrieve
     * @returns SupplierResponseDTO Supplier found
     * @throws ApiError
     */
    public static getSupplierById(
        id: number,
    ): CancelablePromise<SupplierResponseDTO> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/suppliers/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Supplier not found`,
            },
        });
    }
}
