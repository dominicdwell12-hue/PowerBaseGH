// Mirrors the state machine enforced server-side in
// order.service.js / order-status.service.js — keep in sync.
export const ORDER_STATUSES = [
  'Pending',
  'Confirmed',
  'Packed',
  'Shipped',
  'Out_for_Delivery',
  'Delivered',
];

export const CANCELLABLE_STATUSES = ['Pending', 'Confirmed'];

export const PAYMENT_METHODS = {
  PAY_ON_DELIVERY: 'pay_on_delivery',
  CARD: 'card',
  MOBILE_MONEY: 'mobile_money',
};
