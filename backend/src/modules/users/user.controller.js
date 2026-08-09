const userService = require('./user.service');
const authService = require('../auth/auth.service');
const { success } = require('../../utils/apiResponse');

// --- Profile ---

async function getProfile(req, res, next) {
  try {
    const user = await authService.getProfile(req.user.id);
    return success(res, { data: { user } });
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const user = await userService.updateProfile(req.user.id, req.body);
    return success(res, { data: { user }, message: 'Profile updated' });
  } catch (err) {
    next(err);
  }
}

async function changePassword(req, res, next) {
  try {
    await userService.changePassword(req.user.id, req.body);
    return success(res, { message: 'Password changed successfully. Please log in again.' });
  } catch (err) {
    next(err);
  }
}

// --- Addresses ---

async function listAddresses(req, res, next) {
  try {
    const addresses = await userService.listAddresses(req.user.id);
    return success(res, { data: { addresses } });
  } catch (err) {
    next(err);
  }
}

async function addAddress(req, res, next) {
  try {
    const address = await userService.addAddress(req.user.id, req.body);
    return success(res, { data: { address }, message: 'Address added', statusCode: 201 });
  } catch (err) {
    next(err);
  }
}

async function updateAddress(req, res, next) {
  try {
    const address = await userService.updateAddress(req.user.id, Number(req.params.id), req.body);
    return success(res, { data: { address }, message: 'Address updated' });
  } catch (err) {
    next(err);
  }
}

async function setDefaultAddress(req, res, next) {
  try {
    const address = await userService.setDefaultAddress(req.user.id, Number(req.params.id));
    return success(res, { data: { address }, message: 'Default address updated' });
  } catch (err) {
    next(err);
  }
}

async function deleteAddress(req, res, next) {
  try {
    await userService.deleteAddress(req.user.id, Number(req.params.id));
    return success(res, { message: 'Address deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  listAddresses,
  addAddress,
  updateAddress,
  setDefaultAddress,
  deleteAddress,
};
