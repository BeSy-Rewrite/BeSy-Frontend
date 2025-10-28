import { ItemResponseDTO } from "../apiv2";

export const PREFERRED_LIST_NAMES = new Map<ItemResponseDTO.PreferredListEnum, string>([
    [ItemResponseDTO.PreferredListEnum.Rz, 'Rechenzentrum (RZ)'],
    [ItemResponseDTO.PreferredListEnum.Ta, 'Technische Ausstattung (TA)'],
]);
