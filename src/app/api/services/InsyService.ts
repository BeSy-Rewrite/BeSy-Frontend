/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class InsyService {
    /**
     * Sendet eine Bestellung anhand der Bestell-ID an das Insy-System.
     * @param orderId ID der zu sendenden Bestellung.
     * @returns any Bestellung erfolgreich an Insy gesendet.
     * @throws ApiError
     */
    public static postOrderToInsy(
        orderId: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/insy/{order-id}',
            path: {
                'order-id': orderId,
            },
            errors: {
                404: `Bestellung nicht gefunden.`,
                500: `Interner Serverfehler.`,
            },
        });
    }
}
