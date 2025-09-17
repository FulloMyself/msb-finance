const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Admin } = require('../models/Admin');
const { User } = require('../models/User');
const { Loan } = require('../models/Loan');
const { Document } = require('../models/Document');
const { protect, adminOnly } = require('../middleware/auth');

// Admin login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await Admin.findOne({ email });
        if (!admin) return res.status(400).json({ message: 'Admin not found' });

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return res.status(400).json({ message: 'Incorrect password' });

        const token = jwt.sign({ id: admin._id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '12h' });

        res.json({ token, admin: { id: admin._id, email: admin.email, name: admin.name } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Admin: manage all users
router.get('/users', protect, adminOnly, async (req, res) => {
    const users = await User.find({}, 'name email phone createdAt');
    res.json({ users });
});

// Admin: manage all loans
router.get('/loans', protect, adminOnly, async (req, res) => {
    const loans = await Loan.find().populate('user', 'name email');
    res.json({ loans });
});

// Admin: manage all documents
router.get('/docs', protect, adminOnly, async (req, res) => {
    const docs = await Document.find().populate('user', 'name email');
    res.json({ docs });
});

module.exports = router;
