// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models/User');

// ---------- User Login ----------
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // 2️⃣ Find the user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    // 3️⃣ Ensure user has a password
    if (!user.password) {
      return res.status(400).json({ message: 'User does not have a password set' });
    }

    // 4️⃣ Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Incorrect password' });

    // 5️⃣ Create token with role
    const token = jwt.sign(
      { id: user._id, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '12h' }
    );

    // 6️⃣ Return token and user info
    res.json({
      token,
      user: { id: user._id, email: user.email, name: user.name, role: 'user' }
    });

  } catch (err) {
    console.error('User login error:', err); // Log exact error
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

module.exports = router;
