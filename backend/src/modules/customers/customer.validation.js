const { z } = require('zod');

const listCustomersQuerySchema = z.object({
  search: z.string().trim().optional(),
  status: z.enum(['active', 'inactive', 'all']).optional().default('all'),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

const updateCustomerStatusSchema = z.object({
  isActive: z.boolean(),
});

module.exports = { listCustomersQuerySchema, updateCustomerStatusSchema };
