const express = require('express');
const router = express.Router();
const Loan = require('../models/Loan');
const { protect } = require('../middleware/auth');

// POST /api/loans - create loan
router.post('/', protect, async (req, res) => {
  try {
    const { amount, termMonths, income, employment, purpose } = req.body;

    // enforce currency & range
    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount < 300 || numericAmount > 4000) {
      return res.status(400).json({ message: 'Loan amount must be between R300 and R4 000' });
    }

    // basic affordability rule (example): amount <= income * 10 (you can tune)
    if (numericAmount > (Number(income) * 10)) {
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
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/loans/me - list user's loans
router.get('/me', protect, async (req, res) => {
  const loans = await Loan.find({ user: req.user._id }).sort({ appliedAt: -1 });
  res.json({ loans });
});

module.exports = router;
