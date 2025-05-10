const express = require("express");
const router = express.Router();
const axios = require("axios");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "8ae74b4cf76c2e91531a6a5e7ed2ef3a62c4dcaee24d7b176fdfd0ba6c1e9abf"; 

// @route   POST /signup
// @desc    Register new user with email validation and JWT issuance
router.post("/signup", async (req, res) => {
  const { fullName, department, email, password, gender } = req.body;

  // 1. Validate FAST email domain
  if (!email.endsWith("@lhr.nu.edu.pk")) {
    return res.status(400).json({ error: "Only FAST NUCES emails are allowed." });
  }

  // 2. Validate gender field
  if (!gender || !['male', 'female', 'other'].includes(gender.toLowerCase())) {
    return res.status(400).json({ error: "Gender must be 'male', 'female', or 'other'." });
  }

  try {
    // 3. Validate email deliverability via Abstract API
    const validateRes = await axios.get(
      `https://emailvalidation.abstractapi.com/v1/?api_key=${process.env.EMAIL_VALIDATION_API_KEY}&email=${email}`
    );

    if (
      !validateRes.data.deliverability ||
      validateRes.data.deliverability !== "DELIVERABLE"
    ) {
      return res.status(400).json({ error: "Email address is not valid or deliverable." });
    }

    // 4. Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use." });
    }

    // 5. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Hashed password:", hashedPassword);  // Log the hashed password


    // 6. Create and save user
    const newUser = new User({
      fullName,
      department,
      email,
      password: hashedPassword,
      gender,
      rating: 0,
      rides_taken: 0,
      rides_offered: 0
    });

    await newUser.save();

    // 7. Generate JWT token
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // 8. Respond with token and user info
    res.status(201).json({
      message: "User registered successfully.",
      token,
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        department: newUser.department,
        gender: newUser.gender,
        rating: newUser.rating,
        rides_taken: newUser.rides_taken,
        rides_offered: newUser.rides_offered
      },
    });
  } catch (err) {
    console.error("Signup Error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Export the router
module.exports = router;
