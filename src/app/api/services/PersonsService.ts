/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PersonRequestDTO } from '../models/request-dtos/PersonRequestDTO';
import type { PersonResponseDTO } from '../models/response-dtos/PersonResponseDTO';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PersonsService {
    /**
     * @param id
     * @returns PersonResponseDTO OK
     * @throws ApiError
     */
    public static getPersonById(
        id: number,
    ): CancelablePromise<PersonResponseDTO> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/persons/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id
     * @param requestBody
     * @returns PersonResponseDTO OK
     * @throws ApiError
     */
    public static updatePerson(
        id: number,
        requestBody: PersonRequestDTO,
    ): CancelablePromise<PersonResponseDTO> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/persons/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns PersonResponseDTO OK
     * @throws ApiError
     */
    public static getAllPersons(): CancelablePromise<Array<PersonResponseDTO>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/persons',
        });
    }
    /**
     * @param requestBody
     * @returns PersonResponseDTO OK
     * @throws ApiError
     */
    public static createPerson(
        requestBody: PersonRequestDTO,
    ): CancelablePromise<PersonResponseDTO> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/persons',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
