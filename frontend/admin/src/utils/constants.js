export const ORDER_STATUSES = [
  'Pending',
  'Confirmed',
  'Packed',
  'Shipped',
  'Out_for_Delivery',
  'Delivered',
];

// Mirrors ORDER_STATUS_TRANSITIONS in order.service.js — the backend is
// the source of truth and re-validates this regardless, but mirroring it
// here means the status dropdown only ever offers a valid next step.
export const ORDER_STATUS_TRANSITIONS = {
  Pending: ['Confirmed', 'Cancelled'],
  Confirmed: ['Packed', 'Cancelled'],
  Packed: ['Shipped', 'Cancelled'],
  Shipped: ['Out_for_Delivery', 'Cancelled'],
  Out_for_Delivery: ['Delivered'],
  Delivered: [],
  Cancelled: [],
};
