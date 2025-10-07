export interface OrderStatusConfig {
  // Fields that must be filled before changing to the next status
  requiredFields: string[];
  // Status to which the order can be changed from the current status
  allowedStatus: string[];
}

export interface OrderTransitionConfig {
  from: string;
  to: string;
  action: string;
}

export const ORDER_STATUS_CONFIG: Record<string, OrderStatusConfig> = {
  // *In this status, the user can almost freely edit the whole order, only the content description is required.
  // In later statuses, alot of these fields can no longer be edited and the status has to be changed
  // back to IN_PROGRESS in order to edit them.
  IN_PROGRESS: {
    requiredFields: ['content_description'],
    allowedStatus: ['COMPLETED', 'DELETED'],
  },
  // *In this status, all primary fields are filled, e.g. addresses, quotations, articles of the order etc.
  // Next, all approvals by the responsible persons have to be received.
  // As we cannot check which approvals are needed and if the responsible persons have
  // actually approved the order, we allow the user to change the status to APPROVALS_RECEIVED freely.
  COMPLETED: {
    requiredFields: [
      'content_description',
      'primary_cost_center_id',
      'secondary_cost_center_id',
      'booking_year',
      'currency_short',
      'delivery_person_id',
      'invoice_person_id',
      'querys_person_id',
      'customer_id',
      'supplier_id',
      'delivery_address_id',
      'invoice_address_id',
    ],
    allowedStatus: ['APPROVALS_RECEIVED', 'IN_PROGRESS', 'DELETED'],
  },
  // *In this status, all approvals have been received
  // Next, the order has to be reviewed and approved by the responsible person (Dekan).
  APPROVALS_RECEIVED: {
    requiredFields: [
      'content_description',
      'primary_cost_center_id',
      'secondary_cost_center_id',
      'booking_year',
      'currency_short',
      'delivery_person_id',
      'invoice_person_id',
      'querys_person_id',
      'customer_id',
      'supplier_id',
      'delivery_address_id',
      'invoice_address_id',
    ],
    allowedStatus: ['APPROVED', 'DELETED'],
  },
  // *In this status, the order has been approved by the responsible person (Dekan).
  // Next, the order can be sent to the supplier.
  APPROVED: {
    requiredFields: [
      'content_description',
      'primary_cost_center_id',
      'secondary_cost_center_id',
      'booking_year',
      'currency_short',
      'delivery_person_id',
      'invoice_person_id',
      'querys_person_id',
      'customer_id',
      'supplier_id',
      'delivery_address_id',
      'invoice_address_id',
    ],
    allowedStatus: ['SENT', 'DELETED'],
  },
  // *In this status, the order has been sent to the supplier.
  // Next, the order can be settled when the goods have been received.
  SENT: {
    requiredFields: [
      'content_description',
      'primary_cost_center_id',
      'secondary_cost_center_id',
      'booking_year',
      'currency_short',
      'delivery_person_id',
      'invoice_person_id',
      'querys_person_id',
      'customer_id',
      'supplier_id',
      'delivery_address_id',
      'invoice_address_id',
    ],
    allowedStatus: ['SETTLED'],
  },
  // *In this status, the order has been settled.
  // Next, the order can be archived by sending it to INSY.
  SETTLED: {
    requiredFields: [
      'content_description',
      'primary_cost_center_id',
      'secondary_cost_center_id',
      'booking_year',
      'currency_short',
      'delivery_person_id',
      'invoice_person_id',
      'querys_person_id',
      'customer_id',
      'supplier_id',
      'delivery_address_id',
      'invoice_address_id',
    ],
    allowedStatus: [
      'ARCHIVED',
    ],
  },
  // *In this status, the order has been archived and can no longer be edited.
  ARCHIVED: {
    requiredFields: [
      'content_description',
      'primary_cost_center_id',
      'secondary_cost_center_id',
      'booking_year',
      'currency_short',
      'delivery_person_id',
      'invoice_person_id',
      'querys_person_id',
      'customer_id',
      'supplier_id',
      'delivery_address_id',
      'invoice_address_id',
    ],
    allowedStatus: [],
  },
};
