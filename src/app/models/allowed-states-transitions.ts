import { OrderStatus } from "../apiv2";

export type AllowedStateTransitions = Partial<Record<OrderStatus, OrderStatus[]>>;
