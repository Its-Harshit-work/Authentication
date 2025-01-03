// const User = require("../models/user");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const crypto = require("crypto");

// const register = async (req, res) => {
//   try {
//     const { username, email, password } = req.body;
//     const existingUser = await User.findOne({ $or: [{ username }, { email }] });

//     if (existingUser) {
//       return res.status(400).json({ message: "Username or email already exists" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const otp = crypto.randomInt(100000, 999999).toString();

//     const newUser = new User({ username, email, password: hashedPassword, otp });
//     await newUser.save();

//     // Log the OTP for local testing instead of sending an email
//     console.log(`Generated OTP for ${email}: ${otp}`);

//     res.status(201).json({ message: "User registered successfully. Check console for OTP." });
//   } catch (error) {
//     res.status(500).json({ message: "Error occurred while registering.", error });
//   }
// };

// const verifyOTP = async (req, res) => {
//   try {
//     const { email, otp } = req.body;
//     const user = await User.findOne({ email, otp });

//     if (!user) {
//       return res.status(400).json({ message: "Invalid OTP" });
//     }

//     user.isVerified = true;
//     user.otp = null;
//     await user.save();

//     res.status(200).json({ message: "OTP verified successfully" });
//   } catch (error) {
//     res.status(500).json({ message: "Error occurred while verifying OTP.", error });
//   }
// };

// const login = async (req, res) => {
//   try {
//     const { username, email, password } = req.body;
//     const user = await User.findOne({ $or: [{ username }, { email }] });

//     if (!user || !user.isVerified) {
//       return res.status(400).json({ message: "User not found or not verified" });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ message: "Incorrect password" });
//     }

//     const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });
//     res.status(200).json({ message: "Login successful", token });
//   } catch (error) {
//     res.status(500).json({ message: "Error occurred during login.", error });
//   }
// };

// module.exports = { register, verifyOTP, login };


const User = require("../models/user");
const { sendOTP } = require("../utils/otpService");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });

    if (existingUser) {
      return res.status(400).json({ message: "Username or email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = crypto.randomInt(100000, 999999).toString();

    const newUser = new User({ username, email, password: hashedPassword, otp });
    await newUser.save();

    await sendOTP(email, otp);
    res.status(201).json({ message: "User registered successfully. Check your email for OTP." });
  } catch (error) {
    res.status(500).json({ message: "Error occurred while registering.", error });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email, otp });

    if (!user) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    user.isVerified = true;
    user.otp = null;
    await user.save();

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error occurred while verifying OTP.", error });
  }
};

const login = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = await User.findOne({ $or: [{ username }, { email }] });

    if (!user || !user.isVerified) {
      return res.status(400).json({ message: "User not found or not verified" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: "Error occurred during login.", error });
  }
};

module.exports = { register, verifyOTP, login };
