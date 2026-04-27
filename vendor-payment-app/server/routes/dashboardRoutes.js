const express = require('express');
const dashRouter = express.Router();
const { getSummary } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

dashRouter.use(protect);
dashRouter.get('/summary', getSummary);

module.exports = dashRouter;
