const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const Admin = require('../models/Admin');

const JWT_SECRET = process.env.JWT_SECRET || 'CHANGE_THIS_IN_PROD';

// -------------------------
// POST /api/auth/login
// Unified login: Admins or Users
// -------------------------
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password required' });

    // 1) Check admin first
    const admin = await Admin.findOne({ email });
    if (admin) {
      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

      const token = jwt.sign({ id: admin._id, role: 'admin' }, JWT_SECRET, { expiresIn: '12h' });

      return res.json({
        token,
        role: 'admin',
        user: { id: admin._id, name: admin.name, email: admin.email }
      });
    }

    // 2) Check normal user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: 'user' }, JWT_SECRET, { expiresIn: '12h' });

    res.json({
      token,
      role: 'user',
      user: { id: user._id, name: user.name, email: user.email }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// -------------------------
// POST /api/auth/register
// Users only
// -------------------------
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email, and password are required' });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword
    });

    const token = jwt.sign({ id: user._id, role: 'user' }, JWT_SECRET, { expiresIn: '12h' });

    res.json({
      token,
      role: 'user',
      user: { id: user._id, name: user.name, email: user.email }
    });

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
