const { z } = require('zod');

const updateProfileSchema = z.object({
  firstName: z.string().trim().min(2, 'First name must be at least 2 characters').max(100).optional(),
  lastName: z.string().trim().min(2, 'Last name must be at least 2 characters').max(100).optional(),
  email: z.string().trim().email('Enter a valid email address').max(150).optional(),
  phone: z.string().trim().min(9, 'Enter a valid phone number').max(20).optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password is too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

const addressSchema = z.object({
  label: z.string().trim().max(50).optional(),
  recipientName: z.string().trim().min(2, 'Recipient name is required').max(150),
  phone: z.string().trim().min(9, 'Enter a valid phone number').max(20),
  cityId: z.coerce.number().int().positive('Select a delivery city'),
  street: z.string().trim().min(3, 'Street address is required').max(255),
  landmark: z.string().trim().max(255).optional(),
  isDefault: z.boolean().optional().default(false),
});

const updateAddressSchema = addressSchema.partial();

module.exports = {
  updateProfileSchema,
  changePasswordSchema,
  addressSchema,
  updateAddressSchema,
};
