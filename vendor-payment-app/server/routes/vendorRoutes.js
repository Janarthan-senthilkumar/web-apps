const express = require('express');
const router = express.Router();
const { getVendors, getVendor, createVendor, updateVendor, deleteVendor } = require('../controllers/vendorController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', getVendors);
router.get('/:id', getVendor);
router.post('/', authorize('admin', 'accountant'), createVendor);
router.put('/:id', authorize('admin', 'accountant'), updateVendor);
router.delete('/:id', authorize('admin'), deleteVendor);

module.exports = router;
