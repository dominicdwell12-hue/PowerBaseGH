const orderService = require('./order.service');
const { success } = require('../../utils/apiResponse');

async function createOrder(req, res, next) {
  try {
    const order = await orderService.createOrder(req.user.id, req.body);
    return success(res, { data: { order }, message: 'Order placed successfully', statusCode: 201 });
  } catch (err) {
    next(err);
  }
}

async function listOrders(req, res, next) {
  try {
    const { page, limit } = req.query;
    const result = await orderService.listOrders(req.user.id, { page, limit });
    return success(res, { data: result });
  } catch (err) {
    next(err);
  }
}

async function getOrderDetail(req, res, next) {
  try {
    const order = await orderService.getOrderDetail(req.user.id, req.params.orderNumber);
    return success(res, { data: { order } });
  } catch (err) {
    next(err);
  }
}

async function getTracking(req, res, next) {
  try {
    const tracking = await orderService.getTracking(req.user.id, req.params.orderNumber);
    return success(res, { data: { tracking } });
  } catch (err) {
    next(err);
  }
}

async function cancelOrder(req, res, next) {
  try {
    const order = await orderService.cancelOrder(req.user.id, req.params.orderNumber, req.body.reason);
    return success(res, { data: { order }, message: 'Order cancelled' });
  } catch (err) {
    next(err);
  }
}

// --- Admin ---

async function adminListOrders(req, res, next) {
  try {
    const result = await orderService.adminListOrders(req.query);
    return success(res, { data: result });
  } catch (err) {
    next(err);
  }
}

async function adminGetOrder(req, res, next) {
  try {
    const order = await orderService.adminGetOrder(req.params.orderNumber);
    return success(res, { data: { order } });
  } catch (err) {
    next(err);
  }
}

async function adminUpdateStatus(req, res, next) {
  try {
    const order = await orderService.adminUpdateStatus(req.user.id, req.params.orderNumber, req.body);
    return success(res, { data: { order }, message: 'Order status updated' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createOrder,
  listOrders,
  getOrderDetail,
  getTracking,
  cancelOrder,
  adminListOrders,
  adminGetOrder,
  adminUpdateStatus,
};
