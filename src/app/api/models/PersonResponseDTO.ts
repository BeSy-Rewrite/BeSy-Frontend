/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type PersonResponseDTO = {
    id?: number;
    name?: string;
    surname?: string;
    email?: string;
    fax?: string;
    phone?: string;
    title?: string;
    comment?: string;
    address_id?: number;
    gender?: PersonResponseDTO.gender;
};
export namespace PersonResponseDTO {
    export enum gender {
        M = 'm',
        F = 'f',
        D = 'd',
    }
}
