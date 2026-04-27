const express = require('express');
const router = express.Router();
const {
  getBuses, getBusById, createBus, updateBus, deleteBus, getBusStats
} = require('../controllers/busController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/stats', authorize('organisation_head', 'staff'), getBusStats);
router.get('/', getBuses);
router.get('/:id', getBusById);
router.post('/', authorize('organisation_head'), createBus);
router.put('/:id', authorize('organisation_head', 'staff'), updateBus);
router.delete('/:id', authorize('organisation_head'), deleteBus);

module.exports = router;
