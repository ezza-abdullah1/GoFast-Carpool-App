const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const JWT_SECRET = process.env.JWT_SECRET || "8ae74b4cf76c2e91531a6a5e7ed2ef3a62c4dcaee24d7b176fdfd0ba6c1e9abf";

// @route   POST /signin
// POST /api/auth/reset-password/:token
router.post("/reset-password/:token", async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    try {
      const users = await User.find({
        resetPasswordExpires: { $gt: Date.now() },
      });
  
      const user = users.find((user) =>
        bcrypt.compareSync(token, user.resetPasswordToken)
      );
  
      if (!user) return res.status(400).json({ error: "Invalid or expired token" });
  
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
  
      res.json({ message: "Password has been reset successfully" });
    } catch (err) {
      console.error("Reset Password Error:", err);
      res.status(500).json({ error: "Server error" });
    }
  });
  