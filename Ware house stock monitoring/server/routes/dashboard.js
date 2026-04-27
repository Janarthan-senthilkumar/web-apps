const express = require('express');
const router = express.Router();
const {
  getStats, getMovementChart, getTopConsumed, getWarehouseSummary,
  getCategoryDistribution, getRecentActivity, getReorderSuggestions, getAging,
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/stats', getStats);
router.get('/movement-chart', getMovementChart);
router.get('/top-consumed', getTopConsumed);
router.get('/warehouse-summary', getWarehouseSummary);
router.get('/category-distribution', getCategoryDistribution);
router.get('/recent-activity', getRecentActivity);
router.get('/reorder-suggestions', getReorderSuggestions);
router.get('/aging', getAging);

module.exports = router;
