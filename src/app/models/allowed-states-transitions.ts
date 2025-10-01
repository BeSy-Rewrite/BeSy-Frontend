import { OrderStatus } from "../api";

export type AllowedStateTransitions = Partial<Record<OrderStatus, OrderStatus[]>>;
