const express = require('express');
const router = express.Router();
const { getAlerts, getAlert, markAsRead, markAllAsRead, resolveAlert, deleteAlert, getAlertStats } = require('../controllers/alertController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', getAlerts);
router.get('/stats', getAlertStats);
router.put('/read-all', markAllAsRead);
router.get('/:id', getAlert);
router.put('/:id/read', markAsRead);
router.put('/:id/resolve', authorize('admin', 'manager'), resolveAlert);
router.delete('/:id', authorize('admin'), deleteAlert);

module.exports = router;
