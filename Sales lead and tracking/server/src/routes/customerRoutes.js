const express = require("express");

const {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  addInteraction
} = require("../controllers/customerController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.route("/").get(getCustomers).post(createCustomer);
router.route("/:id").get(getCustomerById).put(updateCustomer);
router.post("/:id/interactions", addInteraction);

module.exports = router;
