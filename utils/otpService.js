const nodemailer = require("nodemailer");

const sendOTP = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Your OTP for Authentication",
    text: `Your OTP is: ${otp}`,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { sendOTP };
