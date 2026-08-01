const productService = require('./product.service');
const imageService = require('./product-image.service');
const { success } = require('../../utils/apiResponse');
const AppError = require('../../utils/AppError');

// --- Public ---

async function listProducts(req, res, next) {
  try {
    const result = await productService.listProducts(req.query);
    return success(res, { data: result });
  } catch (err) {
    next(err);
  }
}

async function getProductBySlug(req, res, next) {
  try {
    const product = await productService.getProductBySlug(req.params.slug);
    return success(res, { data: { product } });
  } catch (err) {
    next(err);
  }
}

async function getFeaturedProducts(req, res, next) {
  try {
    const products = await productService.getFeaturedProducts();
    return success(res, { data: { products } });
  } catch (err) {
    next(err);
  }
}

async function getRelatedProducts(req, res, next) {
  try {
    const products = await productService.getRelatedProducts(req.params.slug);
    return success(res, { data: { products } });
  } catch (err) {
    next(err);
  }
}

// --- Admin ---

async function adminListProducts(req, res, next) {
  try {
    const result = await productService.adminListProducts(req.query);
    return success(res, { data: result });
  } catch (err) {
    next(err);
  }
}

async function createProduct(req, res, next) {
  try {
    const product = await productService.createProduct(req.body);
    return success(res, { data: { product }, message: 'Product created', statusCode: 201 });
  } catch (err) {
    next(err);
  }
}

async function updateProduct(req, res, next) {
  try {
    const product = await productService.updateProduct(Number(req.params.id), req.body);
    return success(res, { data: { product }, message: 'Product updated' });
  } catch (err) {
    next(err);
  }
}

async function deleteProduct(req, res, next) {
  try {
    await productService.deleteProduct(Number(req.params.id));
    return success(res, { message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
}

async function updateStock(req, res, next) {
  try {
    const product = await productService.updateStock(Number(req.params.id), req.body.stockQuantity);
    return success(res, { data: { product }, message: 'Stock updated' });
  } catch (err) {
    next(err);
  }
}

async function uploadImages(req, res, next) {
  try {
    if (!req.files || req.files.length === 0) {
      throw new AppError('At least one image file is required', 400);
    }
    const images = await imageService.addImagesToProduct(Number(req.params.id), req.files);
    return success(res, { data: { images }, message: 'Images uploaded', statusCode: 201 });
  } catch (err) {
    next(err);
  }
}

async function deleteImage(req, res, next) {
  try {
    await imageService.deleteProductImage(Number(req.params.id), Number(req.params.imageId));
    return success(res, { message: 'Image removed' });
  } catch (err) {
    next(err);
  }
}

async function setPrimaryImage(req, res, next) {
  try {
    await imageService.setPrimaryImage(Number(req.params.id), Number(req.params.imageId));
    return success(res, { message: 'Primary image updated' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listProducts,
  getProductBySlug,
  getFeaturedProducts,
  getRelatedProducts,
  adminListProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
  uploadImages,
  deleteImage,
  setPrimaryImage,
};
