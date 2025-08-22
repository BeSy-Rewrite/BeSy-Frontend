/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ItemRequestDTO = {
    item_id: number;
    name: string;
    price_per_unit: number;
    quantity: number;
    quantity_unit?: string;
    article_id?: string;
    comment?: string;
    vat_value: string;
    preferred_list?: ItemRequestDTO.preferred_list;
    preferred_list_number?: string;
    vat_type: ItemRequestDTO.vat_type;
};
export namespace ItemRequestDTO {
    export enum preferred_list {
        RZ = 'RZ',
        TA = 'TA',
    }
    export enum vat_type {
        NETTO = 'netto',
        BRUTTO = 'brutto',
    }
}

