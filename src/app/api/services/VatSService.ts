/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { VatResponseDTO } from '../models/VatResponseDTO';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class VatSService {
    /**
     * @returns VatResponseDTO OK
     * @throws ApiError
     */
    public static getAllVats(): CancelablePromise<Array<VatResponseDTO>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/vats',
        });
    }
}
