const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Admin/User login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: 'Invalid email or password' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ message: 'Invalid email or password' });

  const token = jwt.sign({ id: user._id }, 'YOUR_SECRET_KEY', { expiresIn: '1d' });
  res.json({ token, user: { name: user.name, email: user.email, role: user.role } });
});

// Optional: User registration route
router.post('/register', async (req, res) => {
  const { name, email, phone, password } = req.body;
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ message: 'Email exists' });

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, phone, password: hashed });
  res.json({ message: 'User created', user });
});

module.exports = router;
