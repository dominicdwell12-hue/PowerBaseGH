const express = require('express');
const productController = require('./product.controller');
const { authenticate, requireRole } = require('../auth/auth.middleware');
const validateRequest = require('../../middlewares/validateRequest');
const upload = require('../../middlewares/upload');
const {
  adminListProductsQuerySchema,
  createProductSchema,
  updateProductSchema,
  updateStockSchema,
} = require('./product.validation');

const router = express.Router();

// Every route in this file requires an authenticated admin.
router.use(authenticate, requireRole('admin'));

router.get('/', validateRequest(adminListProductsQuerySchema, 'query'), productController.adminListProducts);
router.post('/', validateRequest(createProductSchema), productController.createProduct);
router.put('/:id', validateRequest(updateProductSchema), productController.updateProduct);
router.delete('/:id', productController.deleteProduct);
router.put('/:id/stock', validateRequest(updateStockSchema), productController.updateStock);

router.post('/:id/images', upload.array('images', 8), productController.uploadImages);
router.delete('/:id/images/:imageId', productController.deleteImage);
router.put('/:id/images/:imageId/primary', productController.setPrimaryImage);

module.exports = router;
