const express = require("express");

const { scheduleFollowUp, getFollowUps, completeFollowUp } = require("../controllers/followUpController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.route("/").get(getFollowUps).post(scheduleFollowUp);
router.patch("/:id/complete", completeFollowUp);

module.exports = router;
