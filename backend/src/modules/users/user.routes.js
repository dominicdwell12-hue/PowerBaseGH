const express = require('express');
const userController = require('./user.controller');
const { authenticate, requireRole } = require('../auth/auth.middleware');
const validateRequest = require('../../middlewares/validateRequest');
const {
  updateProfileSchema,
  changePasswordSchema,
  addressSchema,
  updateAddressSchema,
} = require('./user.validation');

const router = express.Router();

router.use(authenticate, requireRole('customer'));

router.get('/profile', userController.getProfile);
router.put('/profile', validateRequest(updateProfileSchema), userController.updateProfile);
router.put('/change-password', validateRequest(changePasswordSchema), userController.changePassword);

router.get('/addresses', userController.listAddresses);
router.post('/addresses', validateRequest(addressSchema), userController.addAddress);
router.put('/addresses/:id', validateRequest(updateAddressSchema), userController.updateAddress);
router.delete('/addresses/:id', userController.deleteAddress);
router.put('/addresses/:id/default', userController.setDefaultAddress);

module.exports = router;
