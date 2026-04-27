const express = require('express');
const router = express.Router();
const { getZones, getZone, createZone, updateZone, deleteZone } = require('../controllers/zoneController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.route('/').get(getZones).post(authorize('admin', 'manager'), createZone);
router.route('/:id').get(getZone).put(authorize('admin', 'manager'), updateZone).delete(authorize('admin'), deleteZone);

module.exports = router;
