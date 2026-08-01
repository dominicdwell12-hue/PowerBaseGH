const express = require('express');
const categoryController = require('./category.controller');
const { authenticate, requireRole } = require('../auth/auth.middleware');
const validateRequest = require('../../middlewares/validateRequest');
const { createCategorySchema, updateCategorySchema } = require('./category.validation');

const router = express.Router();

router.use(authenticate, requireRole('admin'));

router.get('/', categoryController.adminListCategories);
router.post('/', validateRequest(createCategorySchema), categoryController.createCategory);
router.put('/:id', validateRequest(updateCategorySchema), categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
