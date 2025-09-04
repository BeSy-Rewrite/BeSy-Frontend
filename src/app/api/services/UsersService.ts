/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserResponseDTO } from '../models/response-dtos/UserResponseDTO';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UsersService {
    /**
     * @returns UserResponseDTO OK
     * @throws ApiError
     */
    public static getAllUsers(): CancelablePromise<Array<UserResponseDTO>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/users',
        });
    }
    /**
     * @param id
     * @returns UserResponseDTO OK
     * @throws ApiError
     */
    public static getUser(
        id: string,
    ): CancelablePromise<UserResponseDTO> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/users/{id}',
            path: {
                'id': id,
            },
        });
    }
}
