const express = require('express');
const cartController = require('./cart.controller');
const { authenticate, requireRole } = require('../auth/auth.middleware');
const validateRequest = require('../../middlewares/validateRequest');
const { addCartItemSchema, updateCartItemSchema } = require('./cart.validation');

const router = express.Router();

// Cart is a customer-only concern — a logged-out shopper can still
// browse, but adding to cart requires an account so it can persist.
router.use(authenticate, requireRole('customer'));

router.get('/', cartController.getCart);
router.post('/items', validateRequest(addCartItemSchema), cartController.addItem);
router.put('/items/:itemId', validateRequest(updateCartItemSchema), cartController.updateItem);
router.delete('/items/:itemId', cartController.removeItem);
router.delete('/', cartController.clearCart);

module.exports = router;
