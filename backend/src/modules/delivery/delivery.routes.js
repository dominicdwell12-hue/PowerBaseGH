const express = require('express');
const deliveryController = require('./delivery.controller');

const router = express.Router();

router.get('/zones', deliveryController.listZones);
router.get('/zones/:cityId/pod-check', deliveryController.checkPodEligibility);

module.exports = router;
