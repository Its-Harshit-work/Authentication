const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  otp: { type: String },
  isVerified: { type: Boolean, default: false },
  googleId: { type: String, default: null },
});

module.exports = mongoose.model("User", userSchema);
