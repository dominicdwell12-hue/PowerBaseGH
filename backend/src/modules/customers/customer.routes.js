const express = require('express');
const customerController = require('./customer.controller');
const { authenticate, requireRole } = require('../auth/auth.middleware');
const validateRequest = require('../../middlewares/validateRequest');
const { listCustomersQuerySchema, updateCustomerStatusSchema } = require('./customer.validation');

const router = express.Router();

router.use(authenticate, requireRole('admin'));

router.get('/', validateRequest(listCustomersQuerySchema, 'query'), customerController.listCustomers);
router.get('/:id', customerController.getCustomerDetail);
router.put('/:id/status', validateRequest(updateCustomerStatusSchema), customerController.updateCustomerStatus);

module.exports = router;
