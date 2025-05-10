//new
const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const nodemailer = require("nodemailer");

const JWT_SECRET = process.env.JWT_SECRET || "8ae74b4cf76c2e91531a6a5e7ed2ef3a62c4dcaee24d7b176fdfd0ba6c1e9abf";
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";


// POST /api/auth/forgot-password
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    const token = crypto.randomBytes(32).toString("hex");
    const hashedToken = await bcrypt.hash(token, 10);

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

   const resetLink = `http://localhost:5173/reset-password/${token}`;

    // Create Ethereal test account
    const testAccount = await nodemailer.createTestAccount();

    // Configure Ethereal transporter
    const transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    // Send the email
    const info = await transporter.sendMail({
      from: '"NUCES Carpool" <no-reply@nucesapp.com>',
      to: user.email,
      subject: "Password Reset",
      html: `
        <p>You requested a password reset</p>
        <p>Click this <a href="${resetLink}">link</a> to reset your password</p>
      `,
    });

    // Preview URL (for development only)
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log("📧 Preview Email URL:", previewUrl);

    res.json({
      message: "Password reset link sent (preview only)",
      preview: previewUrl,
    });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Export the router
module.exports = router;
