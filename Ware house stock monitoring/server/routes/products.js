const express = require('express');
const router = express.Router();
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.route('/').get(getProducts).post(authorize('admin', 'manager'), createProduct);
router.route('/:id').get(getProduct).put(authorize('admin', 'manager'), updateProduct).delete(authorize('admin', 'manager'), deleteProduct);

module.exports = router;
