// userProfileController.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const authMiddleware = require("../middleware/authMiddleware");

router.put("/update-profile", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullName, department, gender, password } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (fullName) user.fullName = fullName;
    if (department) user.department = department;
    if (gender) user.gender = gender;
    if (password) user.password = await bcrypt.hash(password, 10);

    await user.save();

    const { password: _, ...userWithoutPassword } = user.toObject();
    res.json({ message: "Profile updated", updatedUser: userWithoutPassword });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
