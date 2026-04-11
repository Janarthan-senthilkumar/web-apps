const express = require("express");

const {
  getLeads,
  createLead,
  getLeadById,
  updateLead,
  assignLead,
  updateLeadStatus,
  convertLead,
  deleteLead
} = require("../controllers/leadController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.route("/").get(getLeads).post(createLead);
router.route("/:id").get(getLeadById).put(updateLead).delete(authorize("admin"), deleteLead);
router.patch("/:id/assign", authorize("admin", "manager"), assignLead);
router.patch("/:id/status", updateLeadStatus);
router.post("/:id/convert", convertLead);

module.exports = router;
