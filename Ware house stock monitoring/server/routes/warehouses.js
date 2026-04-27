const express = require('express');
const router = express.Router();
const { getWarehouses, getWarehouse, createWarehouse, updateWarehouse, deleteWarehouse } = require('../controllers/warehouseController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.route('/').get(getWarehouses).post(authorize('admin', 'manager'), createWarehouse);
router.route('/:id').get(getWarehouse).put(authorize('admin', 'manager'), updateWarehouse).delete(authorize('admin'), deleteWarehouse);

module.exports = router;
