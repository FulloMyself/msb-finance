const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const  Loan  = require('../models/Loan');

// -----------------------------
// User routes
// -----------------------------

// POST /api/loans - create loan
router.post('/', protect, async (req, res) => {
    try {
        const { amount, termMonths, income, employment, purpose } = req.body;

        const numericAmount = Number(amount);
        if (isNaN(numericAmount) || numericAmount < 300 || numericAmount > 4000) {
            return res.status(400).json({ message: 'Loan amount must be between R300 and R4 000' });
        }

        if (numericAmount > Number(income) * 10) {
            return res.status(400).json({ message: 'Loan amount exceeds permissible multiple of monthly income' });
        }

        const loan = await Loan.create({
            user: req.user._id,
            amount: numericAmount,
            termMonths: termMonths || 1,
            income,
            employment,
            purpose
        });

        res.json({ loan });
    } catch (err) {
        console.error('Loan creation error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/loans/me - list user's loans
router.get('/me', protect, async (req, res) => {
    try {
        const loans = await Loan.find({ user: req.user._id }).sort({ appliedAt: -1 });
        res.json({ loans });
    } catch (err) {
        console.error('Fetching user loans error:', err);
        res.status(500).json({ message: 'Failed to fetch loans' });
    }
});

// -----------------------------
// Admin route
// -----------------------------

// GET /api/loans/all - get all loans (admin only)
router.get('/all', protect, adminOnly, async (req, res) => {
    try {
        const loans = await Loan.find().populate('user', 'name email').sort({ appliedAt: -1 });
        res.json({ loans });
    } catch (err) {
        console.error('Admin fetching all loans error:', err);
        res.status(500).json({ message: 'Failed to fetch loans' });
    }
});

module.exports = router;
