const express = require('express');
const deliveryController = require('./delivery.controller');
const { authenticate, requireRole } = require('../auth/auth.middleware');
const validateRequest = require('../../middlewares/validateRequest');
const {
  createZoneSchema,
  updateZoneSchema,
  adminListZonesQuerySchema,
} = require('./delivery.validation');

const router = express.Router();

router.use(authenticate, requireRole('admin'));

router.get('/', validateRequest(adminListZonesQuerySchema, 'query'), deliveryController.adminListZones);
router.post('/', validateRequest(createZoneSchema), deliveryController.createZone);
router.put('/:id', validateRequest(updateZoneSchema), deliveryController.updateZone);
router.delete('/:id', deliveryController.deactivateZone);

module.exports = router;
