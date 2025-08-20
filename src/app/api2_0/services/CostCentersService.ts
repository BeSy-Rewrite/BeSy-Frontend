/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CostCenterRequestDTO } from '../models/CostCenterRequestDTO';
import type { CostCenterResponseDTO } from '../models/CostCenterResponseDTO';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CostCentersService {
    /**
     * @returns CostCenterResponseDTO OK
     * @throws ApiError
     */
    public static getCostCenters(): CancelablePromise<Array<CostCenterResponseDTO>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/cost_centers',
        });
    }
    /**
     * @param requestBody
     * @returns CostCenterResponseDTO OK
     * @throws ApiError
     */
    public static createCostCenter(
        requestBody: CostCenterRequestDTO,
    ): CancelablePromise<CostCenterResponseDTO> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/cost_centers',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                409: `Kostenstelle mit diesem Namen existiert bereits.`,
            },
        });
    }
}
