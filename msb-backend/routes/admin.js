const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const adminAuth = require('../middleware/auth');
const { Admin } = require('../models/Admin');
const { User } = require('../models/User');
const { Loan } = require('../models/Loan');
const { Document } = require('../models/Document');

// ---------- Login ----------
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await Admin.findOne({ email });
        if (!admin) return res.status(400).json({ message: 'Admin not found' });

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return res.status(400).json({ message: 'Incorrect password' });

        const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '12h' });
        res.json({ token, admin: { id: admin._id, email: admin.email, name: admin.name } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ---------- Users ----------
router.get('/users', adminAuth, async (req, res) => {
    const users = await User.find({}, 'name email phone createdAt');
    res.json({ users });
});

// ---------- Loans ----------
router.get('/loans', adminAuth, async (req, res) => {
    const loans = await Loan.find().populate('user', 'name email');
    res.json({ loans });
});

// ---------- Update Loan Status ----------
router.patch('/loans/:id', adminAuth, async (req, res) => {
    const { status } = req.body;
    if (!['approved','rejected','pending'].includes(status)) return res.status(400).json({ message: 'Invalid status' });

    const loan = await Loan.findById(req.params.id);
    if (!loan) return res.status(404).json({ message: 'Loan not found' });

    loan.status = status;
    await loan.save();
    res.json({ message: 'Loan status updated' });
});

// ---------- Documents ----------
router.get('/docs', adminAuth, async (req, res) => {
    const docs = await Document.find().populate('user', 'name email');
    res.json({ docs });
});

module.exports = router;
