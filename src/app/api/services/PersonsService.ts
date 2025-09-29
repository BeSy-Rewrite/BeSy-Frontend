/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AddressRequestDTO } from '../models/AddressRequestDTO';
import type { AddressResponseDTO } from '../models/AddressResponseDTO';
import type { PersonRequestDTO } from '../models/PersonRequestDTO';
import type { PersonResponseDTO } from '../models/PersonResponseDTO';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PersonsService {
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
            errors: {
                500: `Interner Serverfehler.`,
            },
        });
    }
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
            errors: {
                404: `Person nicht gefunden.`,
                500: `Interner Serverfehler.`,
            },
        });
    }
    /**
     * @param id
     * @param requestBody
     * @returns PersonResponseDTO OK
     * @throws ApiError
     */
    public static updatePersonById(
        id: number,
        requestBody?: PersonRequestDTO,
    ): CancelablePromise<PersonResponseDTO> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/persons/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                409: `Verweis auf eine nicht existierende Entität.`,
                500: `Interner Serverfehler.`,
            },
        });
    }
    /**
     * Gibt eine Liste aller Adressen zurück, die Personen zugeordnet sind.
     * @returns AddressResponseDTO Erfolgreich – Liste der Personenadressen
     * @throws ApiError
     */
    public static getPersonsAddresses(): CancelablePromise<Array<AddressResponseDTO>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/persons/addresses',
        });
    }
    /**
     * @param requestBody
     * @returns AddressResponseDTO Adresse erfolgreich erstellt.
     * @throws ApiError
     */
    public static createPersonAddress(
        requestBody: AddressRequestDTO,
    ): CancelablePromise<AddressResponseDTO> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/persons/addresses',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Ungültige Eingabe(n).`,
                500: `Interner Serverfehler.`,
            },
        });
    }
    /**
     * Gibt die Adresse der angegebenen Person zurück.
     * @param personId Die ID der Person, deren Adresse abgerufen werden soll
     * @returns AddressResponseDTO Erfolgreich – Adresse der Person
     * @throws ApiError
     */
    public static getPersonsAddress(
        personId: number,
    ): CancelablePromise<AddressResponseDTO> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/persons/{person-id}/address',
            path: {
                'person-id': personId,
            },
            errors: {
                404: `Person nicht gefunden. Diese Person besitzt keine Adresse.`,
            },
        });
    }
}
