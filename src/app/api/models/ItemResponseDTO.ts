/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { VatResponseDTO } from './VatResponseDTO';
export type ItemResponseDTO = {
    item_id?: number;
    name?: string;
    price_per_unit?: number;
    quantity?: number;
    quantity_unit?: string;
    article_id?: string;
    comment?: string;
    vat?: VatResponseDTO;
    preferred_list?: ItemResponseDTO.preferred_list;
    preferred_list_number?: string;
    vat_type?: ItemResponseDTO.vat_type;
};
export namespace ItemResponseDTO {
    export enum preferred_list {
        RZ = 'RZ',
        TA = 'TA',
    }
    export enum vat_type {
        NETTO = 'netto',
        BRUTTO = 'brutto',
    }
}

