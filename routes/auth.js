const express = require("express");
const { register, verifyOTP, login, submitEnterpriseForm } = require("../controllers/authController");
const { authenticate } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/verify-otp", verifyOTP);
router.post("/login", login);
router.post("/enterprise/form", authenticate, submitEnterpriseForm);

module.exports = router;
