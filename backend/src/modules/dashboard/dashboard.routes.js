const express = require('express');
const dashboardController = require('./dashboard.controller');
const { authenticate, requireRole } = require('../auth/auth.middleware');
const validateRequest = require('../../middlewares/validateRequest');
const { salesReportQuerySchema, topProductsQuerySchema } = require('./dashboard.validation');

const router = express.Router();

router.use(authenticate, requireRole('admin'));

router.get('/dashboard/summary', dashboardController.getSummary);
router.get('/reports/sales', validateRequest(salesReportQuerySchema, 'query'), dashboardController.getSalesReport);
router.get('/reports/top-products', validateRequest(topProductsQuerySchema, 'query'), dashboardController.getTopProducts);
router.get('/reports/export', validateRequest(salesReportQuerySchema, 'query'), dashboardController.exportSalesReport);

module.exports = router;
