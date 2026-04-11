const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// GET analytics data (supervisor only)
router.get('/', authMiddleware, requireRole('supervisor'), analyticsController.getAnalytics);

module.exports = router;
