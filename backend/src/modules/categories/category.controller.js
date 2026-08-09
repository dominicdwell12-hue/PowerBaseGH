const categoryService = require('./category.service');
const { success } = require('../../utils/apiResponse');

// --- Public ---

async function listCategories(req, res, next) {
  try {
    const categories = await categoryService.listCategories();
    return success(res, { data: { categories } });
  } catch (err) {
    next(err);
  }
}

async function getCategoryWithProducts(req, res, next) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const result = await categoryService.getCategoryWithProducts(req.params.slug, { page, limit });
    return success(res, { data: result });
  } catch (err) {
    next(err);
  }
}

// --- Admin ---

async function adminListCategories(req, res, next) {
  try {
    const categories = await categoryService.adminListCategories();
    return success(res, { data: { categories } });
  } catch (err) {
    next(err);
  }
}

async function createCategory(req, res, next) {
  try {
    const category = await categoryService.createCategory({ ...req.body, imageFile: req.file });
    return success(res, { data: { category }, message: 'Category created', statusCode: 201 });
  } catch (err) {
    next(err);
  }
}

async function updateCategory(req, res, next) {
  try {
    const category = await categoryService.updateCategory(Number(req.params.id), {
      ...req.body,
      imageFile: req.file,
    });
    return success(res, { data: { category }, message: 'Category updated' });
  } catch (err) {
    next(err);
  }
}

async function deleteCategory(req, res, next) {
  try {
    await categoryService.deleteCategory(Number(req.params.id));
    return success(res, { message: 'Category deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listCategories,
  getCategoryWithProducts,
  adminListCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
