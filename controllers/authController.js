const User = require("../models/user");
const { sendEmail } = require("../utils/emailService");
const { appendToExcel } = require("../utils/excelService");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!role || !["user", "enterprise"].includes(role)) {
      return res.status(400).json({ message: "Role must be either 'user' or 'enterprise'." });
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });

    if (existingUser) {
      return res.status(400).json({ message: "Username or email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = crypto.randomInt(100000, 999999).toString();
    const hashedOtp = await bcrypt.hash(otp, 10); // Encrypt the OTP
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes from now

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      otp: hashedOtp,
      otpExpiresAt: expiresAt,
      role,
    });
    await newUser.save();

    console.log(`User registered: ${newUser}`);

    // Log before sending OTP
    console.log(`Sending OTP to ${email}`);
    await sendEmail(
      email,
      "OTP for Registration",
      `Hello ${username},\n\nYour OTP for registration is: ${otp}\n\nThank you!`
    );

    res.status(201).json({ message: "User registered successfully. Check your email for OTP." });
  } catch (error) {
    console.error("Error occurred during registration:", error);
    res.status(500).json({ message: "Error occurred while registering.", error });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!otp || (typeof otp !== 'string' && typeof otp !== 'number')) {
      return res.status(400).json({ message: "OTP must be a valid number or string." });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or OTP." });
    }

    if (!user.otp || Date.now() > user.otpExpiresAt) {
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    // Convert OTP to string before comparison
    const isOtpValid = await bcrypt.compare(otp.toString(), user.otp);
    if (!isOtpValid) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    user.isVerified = true;
    user.otp = null; // Clear the OTP after verification
    user.otpExpiresAt = null; // Clear the expiration time
    await user.save();

    res.status(200).json({ message: "OTP verified successfully." });
  } catch (error) {
    console.error("Error occurred while verifying OTP:", error);
    res.status(500).json({ message: "Error occurred while verifying OTP.", error });
  }
};

const login = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = await User.findOne({ $or: [{ username }, { email }] });

    if (!user || !user.isVerified) {
      return res.status(400).json({ message: "User not found or not verified." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password." });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("Error occurred during login:", error);
    res.status(500).json({ message: "Error occurred during login.", error });
  }
};

const submitEnterpriseForm = async (req, res) => {
  try {
    const { firstName, lastName, companyName, jobTitle, workEmail, projectBudget, descriptionForm } = req.body;

    if (!firstName || !lastName || !companyName || !jobTitle || !workEmail || !projectBudget || !descriptionForm) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(workEmail)) {
      return res.status(400).json({ message: "Invalid work email format." });
    }

    if (isNaN(projectBudget) || Number(projectBudget) <= 0) {
      return res.status(400).json({ message: "Project budget must be a positive number." });
    }

    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user || user.role !== "enterprise") {
      return res.status(403).json({ message: "Only enterprises can submit this form." });
    }

    user.firstName = firstName;
    user.lastName = lastName;
    user.companyName = companyName;
    user.jobTitle = jobTitle;
    user.workEmail = workEmail;
    user.projectBudget = projectBudget;
    user.descriptionForm = descriptionForm;
    await user.save();

    await appendToExcel("enterprise_responses.xlsx", [
      {
        Date: new Date().toISOString(),
        FirstName: firstName,
        LastName: lastName,
        CompanyName: companyName,
        JobTitle: jobTitle,
        WorkEmail: workEmail,
        ProjectBudget: projectBudget,
        Description: descriptionForm,
      },
    ]);

    res.status(200).json({ message: "Form submitted successfully and saved to Excel." });
  } catch (error) {
    console.error("Error occurred while submitting the form:", error);
    res.status(500).json({ message: "Error occurred while submitting the form.", error });
  }
};

module.exports = { register, verifyOTP, login, submitEnterpriseForm };
