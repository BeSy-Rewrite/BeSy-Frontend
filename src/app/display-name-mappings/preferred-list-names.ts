import { ItemResponseDTO } from "../api-services-v2";

export const PREFERRED_LIST_NAMES = new Map<ItemResponseDTO.PreferredListEnum, string>([
    [ItemResponseDTO.PreferredListEnum.RZ, 'Rechenzentrum (RZ)'],
    [ItemResponseDTO.PreferredListEnum.TA, 'Technische Ausstattung (TA)'],
]);
