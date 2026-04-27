const express = require('express');
const router = express.Router();
const { getOutstandingReport, getVendorWiseReport, getPaymentReport } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/outstanding', getOutstandingReport);
router.get('/vendor-wise', getVendorWiseReport);
router.get('/payments', getPaymentReport);

module.exports = router;
