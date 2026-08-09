const cartService = require('./cart.service');
const { success } = require('../../utils/apiResponse');

async function getCart(req, res, next) {
  try {
    const cart = await cartService.getCart(req.user.id);
    return success(res, { data: { cart } });
  } catch (err) {
    next(err);
  }
}

async function addItem(req, res, next) {
  try {
    const cart = await cartService.addItem(req.user.id, req.body);
    return success(res, { data: { cart }, message: 'Item added to cart', statusCode: 201 });
  } catch (err) {
    next(err);
  }
}

async function updateItem(req, res, next) {
  try {
    const itemId = Number(req.params.itemId);
    const cart = await cartService.updateItemQuantity(req.user.id, itemId, req.body.quantity);
    return success(res, { data: { cart }, message: 'Cart item updated' });
  } catch (err) {
    next(err);
  }
}

async function removeItem(req, res, next) {
  try {
    const itemId = Number(req.params.itemId);
    const cart = await cartService.removeItem(req.user.id, itemId);
    return success(res, { data: { cart }, message: 'Item removed from cart' });
  } catch (err) {
    next(err);
  }
}

async function clearCart(req, res, next) {
  try {
    const cart = await cartService.clearCart(req.user.id);
    return success(res, { data: { cart }, message: 'Cart cleared' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getCart, addItem, updateItem, removeItem, clearCart };
