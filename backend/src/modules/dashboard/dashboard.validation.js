const { z } = require('zod');

const salesReportQuerySchema = z.object({
  period: z.enum(['daily', 'weekly', 'monthly']).optional().default('daily'),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});

const topProductsQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(50).optional().default(10),
});

module.exports = { salesReportQuerySchema, topProductsQuerySchema };
