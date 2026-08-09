const { z } = require('zod');

const listProductsQuerySchema = z.object({
  category: z.string().trim().optional(),
  search: z.string().trim().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  sort: z.enum(['price_asc', 'price_desc', 'newest', 'rating']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// Base object schema (no refine yet) so both create and update can reuse
// it — update needs .partial(), which ZodEffects (post-refine) doesn't support.
const productBaseSchema = z.object({
  name: z.string().trim().min(3).max(255),
  categoryId: z.coerce.number().int().positive(),
  description: z.string().trim().min(10),
  price: z.coerce.number().positive('Price must be greater than 0'),
  discountPrice: z.coerce.number().positive().optional(),
  sku: z.string().trim().min(2).max(100),
  stockQuantity: z.coerce.number().int().nonnegative().default(0),
  brand: z.string().trim().max(100).optional(),
  isFeatured: z.coerce.boolean().optional(),
});

function discountBelowPrice(data) {
  return !data.discountPrice || data.discountPrice < data.price;
}

const createProductSchema = productBaseSchema.refine(discountBelowPrice, {
  message: 'Discount price must be lower than the regular price',
  path: ['discountPrice'],
});

const updateProductSchema = productBaseSchema.partial().refine(discountBelowPrice, {
  message: 'Discount price must be lower than the regular price',
  path: ['discountPrice'],
});

const updateStockSchema = z.object({
  stockQuantity: z.coerce.number().int().nonnegative('Stock cannot be negative'),
});

const adminListProductsQuerySchema = listProductsQuerySchema.extend({
  status: z.enum(['active', 'inactive', 'all']).optional().default('all'),
});

module.exports = {
  listProductsQuerySchema,
  createProductSchema,
  updateProductSchema,
  updateStockSchema,
  adminListProductsQuerySchema,
};
