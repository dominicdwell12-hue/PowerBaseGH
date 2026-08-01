const express = require('express');
const productController = require('./product.controller');
const validateRequest = require('../../middlewares/validateRequest');
const { listProductsQuerySchema } = require('./product.validation');

const router = express.Router();

// Order matters: specific static paths before the dynamic /:slug catch-all.
router.get('/featured', productController.getFeaturedProducts);
router.get('/', validateRequest(listProductsQuerySchema, 'query'), productController.listProducts);
router.get('/:slug/related', productController.getRelatedProducts);
router.get('/:slug', productController.getProductBySlug);

module.exports = router;
