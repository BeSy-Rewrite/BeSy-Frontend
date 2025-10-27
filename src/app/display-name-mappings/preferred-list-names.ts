import { ItemResponseDTO } from "../api";

export const PREFERRED_LIST_NAMES = new Map<ItemResponseDTO.preferred_list, string>([
    [ItemResponseDTO.preferred_list.RZ, 'Rechenzentrum (RZ)'],
    [ItemResponseDTO.preferred_list.TA, 'Technische Ausstattung (TA)'],
]);
