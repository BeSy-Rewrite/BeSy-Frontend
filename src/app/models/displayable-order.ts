import { OrderResponseDTO } from "../api"
import { OrderDisplayData } from "./order-display-data"

export type DisplayableOrder = {
    order: OrderResponseDTO,
    orderDisplay: OrderDisplayData
}
