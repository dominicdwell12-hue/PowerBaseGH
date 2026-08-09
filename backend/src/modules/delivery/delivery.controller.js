const deliveryService = require('./delivery.service');
const { success } = require('../../utils/apiResponse');

async function listZones(req, res, next) {
  try {
    const zones = await deliveryService.listZones();
    return success(res, { data: { zones } });
  } catch (err) {
    next(err);
  }
}

async function checkPodEligibility(req, res, next) {
  try {
    const cityId = Number(req.params.cityId);
    const result = await deliveryService.checkPodEligibility(cityId);
    return success(res, { data: result });
  } catch (err) {
    next(err);
  }
}

// --- Admin ---

async function adminListZones(req, res, next) {
  try {
    const zones = await deliveryService.adminListZones(req.query);
    return success(res, { data: { zones } });
  } catch (err) {
    next(err);
  }
}

async function createZone(req, res, next) {
  try {
    const zone = await deliveryService.createZone(req.body);
    return success(res, { data: { zone }, message: 'Delivery zone created', statusCode: 201 });
  } catch (err) {
    next(err);
  }
}

async function updateZone(req, res, next) {
  try {
    const zone = await deliveryService.updateZone(Number(req.params.id), req.body);
    return success(res, { data: { zone }, message: 'Delivery zone updated' });
  } catch (err) {
    next(err);
  }
}

async function deactivateZone(req, res, next) {
  try {
    const zone = await deliveryService.deactivateZone(Number(req.params.id));
    return success(res, { data: { zone }, message: 'Delivery zone deactivated' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listZones,
  checkPodEligibility,
  adminListZones,
  createZone,
  updateZone,
  deactivateZone,
};
