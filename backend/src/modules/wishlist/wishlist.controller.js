const wishlistService = require('./wishlist.service');
const { success } = require('../../utils/apiResponse');

async function listWishlist(req, res, next) {
  try {
    const wishlist = await wishlistService.listWishlist(req.user.id);
    return success(res, { data: { wishlist } });
  } catch (err) {
    next(err);
  }
}

async function addToWishlist(req, res, next) {
  try {
    const wishlist = await wishlistService.addToWishlist(req.user.id, req.body.productId);
    return success(res, { data: { wishlist }, message: 'Product added to wishlist', statusCode: 201 });
  } catch (err) {
    next(err);
  }
}

async function removeFromWishlist(req, res, next) {
  try {
    const productId = Number(req.params.productId);
    const wishlist = await wishlistService.removeFromWishlist(req.user.id, productId);
    return success(res, { data: { wishlist }, message: 'Product removed from wishlist' });
  } catch (err) {
    next(err);
  }
}

module.exports = { listWishlist, addToWishlist, removeFromWishlist };
