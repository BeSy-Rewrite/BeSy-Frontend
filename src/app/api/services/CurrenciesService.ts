/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CurrencyResponseDTO } from '../models/response-dtos/CurrencyResponseDTO';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CurrenciesService {
    /**
     * @returns CurrencyResponseDTO OK
     * @throws ApiError
     */
    public static getAllCurrencies(): CancelablePromise<Array<CurrencyResponseDTO>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/currencies',
        });
    }
}
