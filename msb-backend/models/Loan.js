const mongoose = require('mongoose');

const LoanSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: Number,
  termMonths: Number,
  income: Number,
  employment: String,
  purpose: String,
  status: { type: String, default: 'pending' },
  appliedAt: { type: Date, default: Date.now }
});

const Loan = mongoose.model('Loan', LoanSchema);
module.exports = Loan;
