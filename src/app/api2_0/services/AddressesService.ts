/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AddressRequestDTO } from '../models/AddressRequestDTO';
import type { AddressResponseDTO } from '../models/AddressResponseDTO';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
import { Inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AddressesService {
    /**
     * @deprecated
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
     * @deprecated
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
     * @deprecated
     * @param id Unique identifier of the address
     * @returns AddressResponseDTO Adresse gefunden.
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
                404: `Adresse nicht gefunden.`,
            },
        });
    }
}
