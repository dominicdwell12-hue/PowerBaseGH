const customerService = require('./customer.service');
const { success } = require('../../utils/apiResponse');

async function listCustomers(req, res, next) {
  try {
    const result = await customerService.listCustomers(req.query);
    return success(res, { data: result });
  } catch (err) {
    next(err);
  }
}

async function getCustomerDetail(req, res, next) {
  try {
    const customer = await customerService.getCustomerDetail(Number(req.params.id));
    return success(res, { data: { customer } });
  } catch (err) {
    next(err);
  }
}

async function updateCustomerStatus(req, res, next) {
  try {
    const customer = await customerService.updateCustomerStatus(Number(req.params.id), req.body.isActive);
    const message = req.body.isActive ? 'Customer account activated' : 'Customer account deactivated';
    return success(res, { data: { customer }, message });
  } catch (err) {
    next(err);
  }
}

module.exports = { listCustomers, getCustomerDetail, updateCustomerStatus };
