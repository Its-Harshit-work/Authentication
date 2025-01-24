const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  otp: { type: String },
  isVerified: { type: Boolean, default: false },
  role: { type: String, enum: ["user", "enterprise"], required: true },
  firstName: { type: String },
  lastName: { type: String },
  companyName: { type: String },
  jobTitle: { type: String },
  workEmail: { type: String },
  projectBudget: { type: Number },
  descriptionForm: { type: String },
});

module.exports = mongoose.model("User", userSchema);
