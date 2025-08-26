/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AddressResponseDTO } from './AddressResponseDTO';
export type SupplierResponseDTO = {
    id?: number;
    name?: string;
    deactivated_date?: string;
    flag_preferred?: boolean;
    vat_id?: string;
    email?: string;
    fax?: string;
    phone?: string;
    comment?: string;
    website?: string;
    address?: AddressResponseDTO;
};

