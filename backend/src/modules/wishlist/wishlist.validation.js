const { z } = require('zod');

const addWishlistItemSchema = z.object({
  productId: z.coerce.number().int().positive(),
});

module.exports = { addWishlistItemSchema };
