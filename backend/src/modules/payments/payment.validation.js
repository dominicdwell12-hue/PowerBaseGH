const { z } = require('zod');

const initializePaymentSchema = z.object({
  orderId: z.coerce.number().int().positive(),
  provider: z.enum(['paystack', 'flutterwave']),
});

module.exports = { initializePaymentSchema };
