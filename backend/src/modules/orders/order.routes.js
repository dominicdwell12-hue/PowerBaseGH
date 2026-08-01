const express = require('express');
const orderController = require('./order.controller');
const { authenticate, requireRole } = require('../auth/auth.middleware');
const validateRequest = require('../../middlewares/validateRequest');
const { createOrderSchema, listOrdersQuerySchema, cancelOrderSchema } = require('./order.validation');

const router = express.Router();

router.use(authenticate, requireRole('customer'));

router.post('/', validateRequest(createOrderSchema), orderController.createOrder);
router.get('/', validateRequest(listOrdersQuerySchema, 'query'), orderController.listOrders);
router.get('/:orderNumber', orderController.getOrderDetail);
router.get('/:orderNumber/tracking', orderController.getTracking);
router.put('/:orderNumber/cancel', validateRequest(cancelOrderSchema), orderController.cancelOrder);

module.exports = router;
