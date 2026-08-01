const { z } = require('zod');

const createCategorySchema = z.object({
  name: z.string().trim().min(2).max(100),
  parentId: z.coerce.number().int().positive().optional(),
  imageUrl: z.string().url().optional(),
});

const updateCategorySchema = createCategorySchema.partial();

module.exports = { createCategorySchema, updateCategorySchema };
