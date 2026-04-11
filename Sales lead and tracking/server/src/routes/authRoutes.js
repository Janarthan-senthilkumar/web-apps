const express = require("express");

const {
  register,
  bootstrapAdmin,
  login,
  me,
  getUsers,
  createUser
} = require("../controllers/authController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.post("/register", register);
router.post("/bootstrap-admin", bootstrapAdmin);
router.post("/login", login);
router.get("/me", protect, me);
router.get("/users", protect, authorize("admin", "manager"), getUsers);
router.post("/users", protect, authorize("admin"), createUser);

module.exports = router;
