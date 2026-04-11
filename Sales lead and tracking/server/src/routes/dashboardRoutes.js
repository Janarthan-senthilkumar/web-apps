const express = require("express");

const { getSummary, getConversionReport, getActivityFeed } = require("../controllers/dashboardController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.get("/summary", getSummary);
router.get("/conversion-report", getConversionReport);
router.get("/activities", getActivityFeed);

module.exports = router;
