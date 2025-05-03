// routes/auth.js
const express = require("express");
const router = express.Router();
const axios = require("axios");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

router.post("/signup", async (req, res) => {
  const { fullName, department, email, password } = req.body;

  // Validate email domain
  if (!email.endsWith("@lhr.nu.edu.pk")) {
    return res.status(400).json({ error: "Only FAST NUCES emails are allowed." });
  }

  try {
    // Optional: Validate email existence via API (e.g. AbstractAPI)
    const validateRes = await axios.get(`https://emailvalidation.abstractapi.com/v1/?api_key=${process.env.EMAIL_VALIDATION_API_KEY}&email=${email}`);
    if (!validateRes.data.deliverability || validateRes.data.deliverability !== "DELIVERABLE") {
      return res.status(400).json({ error: "Email address is not valid or deliverable." });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullName,
      department,
      email,
      password: hashedPassword
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully." });
  } catch (err) {
    console.error("Signup Error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
