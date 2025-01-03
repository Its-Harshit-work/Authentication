const express = require("express");
const { register, verifyOTP, login } = require("../controllers/authController");
const { authenticate } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/verify-otp", verifyOTP);
router.post("/login", login);

module.exports = router;
