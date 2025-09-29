/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { OrderResponseDTO } from './OrderResponseDTO';
import type { Sort } from './Sort';
export type PagedOrderResponseDTO = {
    content?: Array<OrderResponseDTO>;
    pageable?: {
        page_number?: number;
        page_size?: number;
        sort?: Sort;
        offset?: number;
        paged?: boolean;
        unpaged?: boolean;
    };
    last?: boolean;
    total_pages?: number;
    total_elements?: number;
    size?: number;
    number?: number;
    sort?: Sort;
    first?: boolean;
    number_of_elements?: number;
    empty?: boolean;
};

