const express = require('express');
const categoryController = require('./category.controller');

const router = express.Router();

router.get('/', categoryController.listCategories);
router.get('/:slug', categoryController.getCategoryWithProducts);

module.exports = router;
