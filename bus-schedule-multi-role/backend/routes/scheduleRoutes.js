const express = require('express');
const router = express.Router();
const {
  getSchedules, getScheduleById, createSchedule, updateSchedule, deleteSchedule,
  searchSchedules, getScheduleStats
} = require('../controllers/scheduleController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/stats', authorize('organisation_head', 'staff'), getScheduleStats);
router.get('/search', searchSchedules);
router.get('/', getSchedules);
router.get('/:id', getScheduleById);
router.post('/', authorize('organisation_head'), createSchedule);
router.put('/:id', authorize('organisation_head', 'staff'), updateSchedule);
router.delete('/:id', authorize('organisation_head'), deleteSchedule);

module.exports = router;
