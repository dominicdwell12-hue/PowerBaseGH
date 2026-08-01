const { z } = require('zod');

const zoneBaseSchema = z.object({
  cityName: z.string().trim().min(2, 'City name is required').max(100),
  region: z.string().trim().max(100).optional(),
  payOnDeliveryEnabled: z.boolean().optional().default(false),
  deliveryFee: z.coerce.number().nonnegative('Delivery fee cannot be negative'),
  estimatedDays: z.string().trim().max(20).optional(),
});

const createZoneSchema = zoneBaseSchema;

const updateZoneSchema = zoneBaseSchema.partial().extend({
  isActive: z.boolean().optional(),
});

const adminListZonesQuerySchema = z.object({
  status: z.enum(['active', 'inactive', 'all']).optional().default('all'),
});

module.exports = { createZoneSchema, updateZoneSchema, adminListZonesQuerySchema };
