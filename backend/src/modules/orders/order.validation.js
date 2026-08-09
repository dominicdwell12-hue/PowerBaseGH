const { z } = require('zod');

const createOrderSchema = z.object({
  addressId: z.coerce.number().int().positive(),
  paymentMethod: z.enum(['card', 'mobile_money', 'pay_on_delivery']),
});

const listOrdersQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

const cancelOrderSchema = z.object({
  reason: z.string().trim().max(255).optional(),
});

const ORDER_STATUS_VALUES = ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Out_for_Delivery', 'Delivered', 'Cancelled'];

const adminListOrdersQuerySchema = z.object({
  status: z.enum(ORDER_STATUS_VALUES).optional(),
  paymentStatus: z.enum(['pending', 'paid', 'failed', 'refunded']).optional(),
  dateFrom: z.string().trim().optional(),
  dateTo: z.string().trim().optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

const updateOrderStatusSchema = z.object({
  status: z.enum(ORDER_STATUS_VALUES),
  note: z.string().trim().max(255).optional(),
});

module.exports = {
  createOrderSchema,
  listOrdersQuerySchema,
  cancelOrderSchema,
  adminListOrdersQuerySchema,
  updateOrderStatusSchema,
};
