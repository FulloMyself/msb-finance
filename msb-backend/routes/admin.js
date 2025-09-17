// routes/admin.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const { Admin } = require('../models/Admin');
const { User } = require('../models/User');
const { Loan } = require('../models/Loan');
const { Document } = require('../models/Document');

// 🔑 Import middleware
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

// ---------- Admin Login ----------
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ message: 'Admin not found' });

    // Compare password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: 'Incorrect password' });

    // Sign JWT with admin role
    const token = jwt.sign(
      { id: admin._id, role: 'admin' }, 
      process.env.JWT_SECRET, 
      { expiresIn: '12h' }
    );

    res.json({
      token,
      admin: { id: admin._id, email: admin.email, name: admin.name }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------- Admin Routes ----------

// Manage all users
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find({}, 'name email phone createdAt');
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Manage all loans
router.get('/loans', protect, adminOnly, async (req, res) => {
  try {
    const loans = await Loan.find().populate('user', 'name email');
    res.json({ loans });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update loan status
router.patch('/loans/:id', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const loan = await Loan.findById(req.params.id);
    if (!loan) return res.status(404).json({ message: 'Loan not found' });

    loan.status = status;
    await loan.save();
    res.json({ message: 'Loan status updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Manage all documents

router.get('/docs', protect, adminOnly, async (req, res) => {
  try {
    const docs = await Document.find().populate('user', 'name email');
    res.json({ docs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
