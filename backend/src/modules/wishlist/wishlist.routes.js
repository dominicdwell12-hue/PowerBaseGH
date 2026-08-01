const express = require('express');
const wishlistController = require('./wishlist.controller');
const { authenticate, requireRole } = require('../auth/auth.middleware');
const validateRequest = require('../../middlewares/validateRequest');
const { addWishlistItemSchema } = require('./wishlist.validation');

const router = express.Router();

router.use(authenticate, requireRole('customer'));

router.get('/', wishlistController.listWishlist);
router.post('/', validateRequest(addWishlistItemSchema), wishlistController.addToWishlist);
router.delete('/:productId', wishlistController.removeFromWishlist);

module.exports = router;
