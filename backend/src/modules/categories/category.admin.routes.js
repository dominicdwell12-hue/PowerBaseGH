const express = require('express');
const categoryController = require('./category.controller');
const { authenticate, requireRole } = require('../auth/auth.middleware');
const validateRequest = require('../../middlewares/validateRequest');
const upload = require('../../middlewares/upload');
const { createCategorySchema, updateCategorySchema } = require('./category.validation');

const router = express.Router();

router.use(authenticate, requireRole('admin'));

router.get('/', categoryController.adminListCategories);
// `upload.single('image')` runs before validation so it can parse the
// multipart body (populating req.body's text fields and req.file with the
// image); it reuses the same multer instance/limits as product images.
router.post('/', upload.single('image'), validateRequest(createCategorySchema), categoryController.createCategory);
router.put('/:id', upload.single('image'), validateRequest(updateCategorySchema), categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
