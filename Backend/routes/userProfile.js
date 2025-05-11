// routes/user.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const upload = require('../middleware/upload');

// GET user profile
router.get('/:id', async (req, res) => {
  const user = await User.findById(req.params.id).select('-__v');
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// PUT update user profile
router.put('/:id', upload.single('profilePic'), async (req, res) => {
  const { fullName, department } = req.body;
  const profilePic = req.file ? `/uploads/${req.file.filename}` : undefined;

  const updatedFields = { fullName, department };
  if (profilePic) updatedFields.profilePic = profilePic;

  try {
    const user = await User.findByIdAndUpdate(req.params.id, updatedFields, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
