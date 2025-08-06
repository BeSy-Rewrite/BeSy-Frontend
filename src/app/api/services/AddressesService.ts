/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AddressRequestDTO } from '../models/request-dtos/AddressRequestDTO';
import type { AddressResponseDTO } from '../models/response-dtos/AddressResponseDTO';
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
        /*return __request(OpenAPI, {
            method: 'GET',
            url: '/addresses',
        });*/

        const mockData: AddressResponseDTO[] = [
      {
        id: 1,
        postal_code: '12345',
        building_name: 'Alpha Tower',
        building_number: '10A',
        comment: 'Main office',
        country: 'Germany',
        county: 'Baden-Württemberg',
        name: 'Hochschule Esslingen',
        street: 'Neckarstraße',
        town: 'Esslingen',
      },
      {
        id: 2,
        postal_code: '67890',
        building_name: 'Beta Haus',
        building_number: '2B',
        comment: 'Nebenstelle',
        country: 'Germany',
        county: 'Baden-Württemberg',
        name: 'Campus Stadtmitte',
        street: 'Hauptstraße',
        town: 'Stuttgart',
      },
    ];

     return Promise.resolve(mockData) as CancelablePromise<AddressResponseDTO[]>;
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
        /*return __request(OpenAPI, {
            method: 'GET',
            url: '/addresses/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Address not found`,
            },
        });*/

        // Mock data for testing
        const mockData: AddressResponseDTO[] = [
            {
                id: 1,
                postal_code: '12345',
                building_name: 'Alpha Tower',
                building_number: '10A',
                comment: 'Main office',
                country: 'Germany',
                county: 'Baden-Württemberg',
                name: 'Hochschule Esslingen',
                street: 'Neckarstraße',
                town: 'Esslingen',
            },
            {
                id: 2,
                postal_code: '67890',
                building_name: 'Beta Haus',
                building_number: '2B',
                comment: 'Nebenstelle',
                country: 'Germany',
                county: 'Baden-Württemberg',
                name: 'Campus Stadtmitte',
                street: 'Hauptstraße',
                town: 'Stuttgart',
            },
        ];

        const address = mockData.find(addr => addr.id === id);
        if (address) {
            return Promise.resolve(address) as CancelablePromise<AddressResponseDTO>;
        } else {
            return Promise.reject(new Error('Address not found')) as CancelablePromise<AddressResponseDTO>;
        }
    }
}
