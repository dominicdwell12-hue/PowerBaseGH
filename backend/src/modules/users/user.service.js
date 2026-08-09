const bcrypt = require('bcryptjs');
const prisma = require('../../config/database');
const AppError = require('../../utils/AppError');
const { toPublicUser } = require('../auth/auth.service');

const SALT_ROUNDS = 10;

// --- Profile ---

async function updateProfile(userId, data) {
  if (data.email) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing && existing.id !== userId) {
      throw new AppError('An account with this email already exists', 409);
    }
  }

  if (data.phone) {
    const existing = await prisma.user.findUnique({ where: { phone: data.phone } });
    if (existing && existing.id !== userId) {
      throw new AppError('An account with this phone number already exists', 409);
    }
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data,
    include: { role: true },
  });

  return toPublicUser(user);
}

async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const matches = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!matches) {
    throw new AppError('Current password is incorrect', 401);
  }

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

  // Changing the password also invalidates any existing refresh token —
  // if the account was compromised, this kicks out any other session.
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash, refreshTokenHash: null },
  });
}

// --- Addresses ---

function serializeAddress(address) {
  return {
    id: address.id,
    label: address.label,
    recipientName: address.recipientName,
    phone: address.phone,
    street: address.street,
    landmark: address.landmark,
    isDefault: address.isDefault,
    city: address.deliveryZone
      ? { id: address.deliveryZone.id, name: address.deliveryZone.cityName, region: address.deliveryZone.region }
      : { id: address.cityId },
    createdAt: address.createdAt,
  };
}

async function listAddresses(userId) {
  const addresses = await prisma.address.findMany({
    where: { userId },
    include: { deliveryZone: true },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  });
  return addresses.map(serializeAddress);
}

async function assertActiveZone(cityId) {
  const zone = await prisma.deliveryZone.findUnique({ where: { id: cityId } });
  if (!zone || !zone.isActive) {
    throw new AppError('Selected delivery city is not available', 400);
  }
  return zone;
}

async function addAddress(userId, data) {
  await assertActiveZone(data.cityId);

  const existingCount = await prisma.address.count({ where: { userId } });
  // The very first address a customer saves becomes their default
  // automatically — otherwise checkout would have nothing to preselect.
  const shouldBeDefault = data.isDefault || existingCount === 0;

  const address = await prisma.$transaction(async (tx) => {
    if (shouldBeDefault) {
      await tx.address.updateMany({ where: { userId, isDefault: true }, data: { isDefault: false } });
    }
    return tx.address.create({
      data: { ...data, userId, isDefault: shouldBeDefault },
      include: { deliveryZone: true },
    });
  });

  return serializeAddress(address);
}

async function getOwnAddress(userId, addressId) {
  const address = await prisma.address.findUnique({ where: { id: addressId }, include: { deliveryZone: true } });
  if (!address || address.userId !== userId) {
    throw new AppError('Address not found', 404);
  }
  return address;
}

async function updateAddress(userId, addressId, data) {
  await getOwnAddress(userId, addressId);

  if (data.cityId) {
    await assertActiveZone(data.cityId);
  }

  const address = await prisma.$transaction(async (tx) => {
    if (data.isDefault) {
      await tx.address.updateMany({ where: { userId, isDefault: true }, data: { isDefault: false } });
    }
    return tx.address.update({ where: { id: addressId }, data, include: { deliveryZone: true } });
  });

  return serializeAddress(address);
}

async function setDefaultAddress(userId, addressId) {
  await getOwnAddress(userId, addressId);

  const address = await prisma.$transaction(async (tx) => {
    await tx.address.updateMany({ where: { userId, isDefault: true }, data: { isDefault: false } });
    return tx.address.update({ where: { id: addressId }, data: { isDefault: true }, include: { deliveryZone: true } });
  });

  return serializeAddress(address);
}

async function deleteAddress(userId, addressId) {
  const address = await getOwnAddress(userId, addressId);

  const ordersUsingAddress = await prisma.order.count({ where: { addressId } });
  if (ordersUsingAddress > 0) {
    throw new AppError('This address is linked to past orders and cannot be deleted', 409);
  }

  await prisma.address.delete({ where: { id: addressId } });

  // If the deleted address was the default, promote the most recently
  // added remaining address so checkout always has a default to offer.
  if (address.isDefault) {
    const next = await prisma.address.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } });
    if (next) {
      await prisma.address.update({ where: { id: next.id }, data: { isDefault: true } });
    }
  }
}

module.exports = {
  updateProfile,
  changePassword,
  listAddresses,
  addAddress,
  updateAddress,
  setDefaultAddress,
  deleteAddress,
};
