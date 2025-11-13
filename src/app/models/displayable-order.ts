import { OrderResponseDTO } from "../api-services-v2"
import { OrderDisplayData } from "./order-display-data"

export type DisplayableOrder = {
    order: OrderResponseDTO,
    orderDisplay: OrderDisplayData
}
