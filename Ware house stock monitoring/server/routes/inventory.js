const express = require('express');
const router = express.Router();
const { getInventory, getInventoryItem, createInventory, updateInventory, deleteInventory } = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.route('/').get(getInventory).post(authorize('admin', 'manager'), createInventory);
router.route('/:id').get(getInventoryItem).put(authorize('admin', 'manager'), updateInventory).delete(authorize('admin'), deleteInventory);

module.exports = router;
