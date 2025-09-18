const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Admin } = require('../models/Admin');
const { User } = require('../models/User');
const { Loan } = require('../models/Loan');
const { Document } = require('../models/Document');
const { protect, adminOnly } = require('../middleware/auth');

// -------------------------
// Admin Login
// -------------------------
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: admin._id, role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: '12h' }
        );

        res.json({
            token,
            admin: {
                id: admin._id,
                email: admin.email,
                name: admin.name
            }
        });
    } catch (err) {
        console.error('Admin login error:', err);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// -------------------------
// Get all users
// -------------------------
router.get('/users', protect, adminOnly, async (req, res) => {
    try {
        const users = await User.find({}, 'name email phone createdAt');
        res.json({ users });
    } catch (err) {
        console.error('Fetch users error:', err);
        res.status(500).json({ message: 'Failed to fetch users' });
    }
});

// -------------------------
// Get all loans
// -------------------------
router.get('/loans', protect, adminOnly, async (req, res) => {
    try {
        const loans = await Loan.find().populate('user', 'name email');
        res.json({ loans });
    } catch (err) {
        console.error('Fetch loans error:', err);
        res.status(500).json({ message: 'Failed to fetch loans' });
    }
});

// -------------------------
// Update loan status
// -------------------------
router.patch('/loans/:id', protect, adminOnly, async (req, res) => {
    try {
        const { status } = req.body;

        if (!['approved', 'rejected', 'pending'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const loan = await Loan.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).populate('user', 'name email');

        if (!loan) {
            return res.status(404).json({ message: 'Loan not found' });
        }

        res.json({ loan });
    } catch (err) {
        console.error('Update loan status error:', err);
        res.status(500).json({ message: 'Failed to update loan status' });
    }
});

// -------------------------
// Get all documents
// -------------------------
router.get('/docs', protect, adminOnly, async (req, res) => {
    try {
        const docs = await Document.find().populate('user', 'name email');
        res.json({ docs });
    } catch (err) {
        console.error('Fetch documents error:', err);
        res.status(500).json({ message: 'Failed to fetch documents' });
    }
});

module.exports = router;
