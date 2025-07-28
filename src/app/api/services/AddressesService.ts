/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AddressRequestDTO } from '../models/AddressRequestDTO';
import type { AddressResponseDTO } from '../models/AddressResponseDTO';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AddressesService {
    /**
     * Get all addresses
     * @returns AddressResponseDTO A list of addresses
     * @throws ApiError
     */
    public static getAllAddresses(): CancelablePromise<Array<AddressResponseDTO>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/addresses',
        });
    }
    /**
     * Create a new address
     * @param requestBody
     * @returns AddressResponseDTO Address created successfully
     * @throws ApiError
     */
    public static createAddress(
        requestBody: AddressRequestDTO,
    ): CancelablePromise<AddressResponseDTO> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/addresses',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid input`,
            },
        });
    }
    /**
     * Get a specific address by ID
     * @param id Unique identifier of the address
     * @returns AddressResponseDTO Address found
     * @throws ApiError
     */
    public static getAddressById(
        id: number,
    ): CancelablePromise<AddressResponseDTO> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/addresses/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Address not found`,
            },
        });
    }
}
