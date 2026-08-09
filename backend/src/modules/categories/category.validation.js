const { z } = require('zod');

// imageUrl is intentionally NOT accepted here — category images are set by
// uploading a file (see category.admin.routes.js's `upload.single('image')`),
// never by the admin submitting a URL directly.
const createCategorySchema = z.object({
  name: z.string().trim().min(2).max(100),
  parentId: z.coerce.number().int().positive().optional(),
});

const updateCategorySchema = createCategorySchema.partial().extend({
  // Sent as the string 'true' from multipart form data when the admin
  // clicks "Remove" with no replacement file selected.
  removeImage: z
    .enum(['true', 'false'])
    .optional()
    .transform((value) => value === 'true'),
});

module.exports = { createCategorySchema, updateCategorySchema };
