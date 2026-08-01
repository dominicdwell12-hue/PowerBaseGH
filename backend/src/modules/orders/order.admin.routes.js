const express = require('express');
const orderController = require('./order.controller');
const { authenticate, requireRole } = require('../auth/auth.middleware');
const validateRequest = require('../../middlewares/validateRequest');
const { adminListOrdersQuerySchema, updateOrderStatusSchema } = require('./order.validation');

const router = express.Router();

router.use(authenticate, requireRole('admin'));

router.get('/', validateRequest(adminListOrdersQuerySchema, 'query'), orderController.adminListOrders);
router.get('/:orderNumber', orderController.adminGetOrder);
router.put('/:orderNumber/status', validateRequest(updateOrderStatusSchema), orderController.adminUpdateStatus);

module.exports = router;
