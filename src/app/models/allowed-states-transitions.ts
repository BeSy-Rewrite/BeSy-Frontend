import { OrderStatus } from "../api-services-v2";

export type AllowedStateTransitions = Partial<Record<OrderStatus, OrderStatus[]>>;
