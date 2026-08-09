const prisma = require('../../config/database');
const AppError = require('../../utils/AppError');

function serializeZone(zone) {
  return {
    id: zone.id,
    cityName: zone.cityName,
    region: zone.region,
    payOnDeliveryEnabled: zone.payOnDeliveryEnabled,
    deliveryFee: Number(zone.deliveryFee),
    estimatedDays: zone.estimatedDays,
    isActive: zone.isActive,
  };
}

// Public list — used to populate the city dropdown at checkout, with
// enough info (fee, POD flag, estimate) for the frontend to render it
// without a second round trip per city.
async function listZones() {
  const zones = await prisma.deliveryZone.findMany({
    where: { isActive: true },
    orderBy: { cityName: 'asc' },
  });
  return zones.map(serializeZone).map(({ isActive, ...rest }) => rest);
}

// Called live as the customer picks/changes their city at checkout, so
// the UI can grey out "Pay on Delivery" immediately rather than letting
// them select it and failing later on order submit.
async function checkPodEligibility(cityId) {
  const zone = await prisma.deliveryZone.findUnique({ where: { id: cityId } });

  if (!zone || !zone.isActive) {
    throw new AppError('Delivery zone not found', 404);
  }

  return {
    cityId: zone.id,
    cityName: zone.cityName,
    payOnDeliveryAvailable: zone.payOnDeliveryEnabled,
    deliveryFee: Number(zone.deliveryFee),
    estimatedDays: zone.estimatedDays,
  };
}

// --- Admin ---
//
// Note: payOnDeliveryEnabled is intentionally left admin-configurable
// per city, matching what the API spec calls for here — this module
// doesn't hardcode a Kumasi-only restriction. The actual checkout-time
// enforcement (order.service.js::createOrder) always reads this flag
// live from whatever zone the order's address belongs to, so flipping
// it here is exactly how "expand POD to another city" would be done.

async function adminListZones({ status = 'all' } = {}) {
  const where = {
    ...(status === 'active' ? { isActive: true } : {}),
    ...(status === 'inactive' ? { isActive: false } : {}),
  };

  const zones = await prisma.deliveryZone.findMany({ where, orderBy: { cityName: 'asc' } });
  return zones.map(serializeZone);
}

async function assertUniqueCityName(cityName, excludeId) {
  const existing = await prisma.deliveryZone.findUnique({ where: { cityName } });
  if (existing && existing.id !== excludeId) {
    throw new AppError(`A delivery zone for "${cityName}" already exists`, 409);
  }
}

async function createZone(data) {
  await assertUniqueCityName(data.cityName);
  const zone = await prisma.deliveryZone.create({ data });
  return serializeZone(zone);
}

async function getZoneById(id) {
  const zone = await prisma.deliveryZone.findUnique({ where: { id } });
  if (!zone) {
    throw new AppError('Delivery zone not found', 404);
  }
  return zone;
}

async function updateZone(id, data) {
  await getZoneById(id);
  if (data.cityName) {
    await assertUniqueCityName(data.cityName, id);
  }
  const zone = await prisma.deliveryZone.update({ where: { id }, data });
  return serializeZone(zone);
}

// "Delete" here means deactivate, not a hard row delete — addresses and
// past orders reference this zone by foreign key, so removing the row
// would break their history. Deactivating flows through the same
// isActive check checkout already relies on (both here and in
// order.service.js::createOrder), so it takes effect immediately.
async function deactivateZone(id) {
  await getZoneById(id);
  const zone = await prisma.deliveryZone.update({ where: { id }, data: { isActive: false } });
  return serializeZone(zone);
}

module.exports = {
  listZones,
  checkPodEligibility,
  adminListZones,
  createZone,
  updateZone,
  deactivateZone,
};
