/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AddressRequestDTO } from './AddressRequestDTO';
export type SupplierRequestDTO = {
    name: string;
    flag_preferred: boolean;
    vat_id?: string;
    email?: string;
    fax?: string;
    phone?: string;
    comment?: string;
    website?: string;
    address: AddressRequestDTO;
};

