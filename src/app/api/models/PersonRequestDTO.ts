/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type PersonRequestDTO = {
    name: string;
    surname: string;
    email?: string;
    fax?: string;
    phone?: string;
    title?: string;
    comment?: string;
    address_id?: number;
    gender: PersonRequestDTO.gender;
};
export namespace PersonRequestDTO {
    export enum gender {
        M = 'm',
        F = 'f',
        D = 'd',
    }
}

