// const express = require('express');
// const router = express.Router();
// const crypto = require('crypto');
// const bcrypt = require('bcryptjs');
// const User = require('../models/User');
// const transporter = require('../config/nodemailer'); // Import the transporter

// router.post('/forgot-password', async (req, res) => {
//   const { email } = req.body;
//   try {
//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ error: 'User not found' });

//     const token = crypto.randomBytes(32).toString('hex');
//     const hashedToken = await bcrypt.hash(token, 10);

//     user.resetPasswordToken = hashedToken;
//     user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
//     await user.save();

//     const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;

//     await transporter.sendMail({
//       to: user.email,
//       subject: 'Password Reset',
//       html: `<p>You requested a password reset</p>
//              <p>Click this <a href="${resetLink}">link</a> to reset your password</p>`,
//     });

//     res.json({ message: 'Password reset link sent to your email' });
//   } catch (err) {
//     console.error('Forgot Password Error:', err);
//     res.status(500).json({ error: 'Server error' });
//   }
// });
// router.post('/reset-password/:token', async (req, res) => {
//   const { token } = req.params;
//   const { password } = req.body;
//   try {
//     const users = await User.find({
//       resetPasswordExpires: { $gt: Date.now() },
//     });

//     const user = users.find((user) =>
//       bcrypt.compareSync(token, user.resetPasswordToken)
//     );

//     if (!user) return res.status(400).json({ error: 'Invalid or expired token' });

//     const hashedPassword = await bcrypt.hash(password, 10);
//     user.password = hashedPassword;
//     user.resetPasswordToken = undefined;
//     user.resetPasswordExpires = undefined;
//     await user.save();

//     res.json({ message: 'Password has been reset successfully' });
//   } catch (err) {
//     console.error('Reset Password Error:', err);
//     res.status(500).json({ error: 'Server error' });
//   }
// });
