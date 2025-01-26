const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  otp: { type: String, default: null },
  otpExpiresAt: { type: Date, default: null },
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }, // Timestamp for account creation
  credits: { type: Number, default: 300 }, // Default credits for new users, will change it based on formulae in future
  datasets: [{ type: mongoose.Schema.Types.ObjectId, ref: "Dataset" }], // List of dataset IDs
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
