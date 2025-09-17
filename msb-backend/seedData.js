require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const { Admin } = require('./models/Admin');
const { User } = require('./models/User');
const { Loan } = require('./models/Loan');
const { Document } = require('./models/Document');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/msbfinance';

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // ---------- Seed Admin ----------
    const adminEmail = 'admin@msbfinance.com';
    const adminExists = await Admin.findOne({ email: adminEmail });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('Admin123!', 10);
      const admin = new Admin({ name: 'Super Admin', email: adminEmail, password: hashedPassword });
      await admin.save();
      console.log('Admin created');
    } else {
      console.log('Admin already exists');
    }

    // ---------- Seed Users ----------
    const users = [
      { name: 'Alice Maseko', email: 'alice@example.com', phone: '0811111111' },
      { name: 'Bob Dlamini', email: 'bob@example.com', phone: '0822222222' },
      { name: 'Carol Khumalo', email: 'carol@example.com', phone: '0833333333' },
      { name: 'David Nkosi', email: 'david@example.com', phone: '0844444444' },
      { name: 'Eve Tshabalala', email: 'eve@example.com', phone: '0855555555' },
    ];

    const savedUsers = [];
    for (const u of users) {
      let user = await User.findOne({ email: u.email });
      if (!user) {
        user = new User(u);
        await user.save();
        console.log(`User created: ${u.name}`);
      }
      savedUsers.push(user);
    }

    // ---------- Seed Loans ----------
    const loanStatuses = ['pending', 'approved', 'rejected'];

    for (const user of savedUsers) {
      const numLoans = Math.floor(Math.random() * 3) + 1; // 1-3 loans per user
      for (let i = 0; i < numLoans; i++) {
        const status = loanStatuses[Math.floor(Math.random() * loanStatuses.length)];
        const amount = Math.floor(Math.random() * 10000) + 500; // 500 - 10500
        const loan = new Loan({
          user: user._id,
          amount: amount,
          status: status,
          purpose: ['Business', 'Education', 'Car', 'Personal'][Math.floor(Math.random() * 4)],
        });
        await loan.save();
        console.log(`Loan created for: ${user.name} | Amount: ${amount} | Status: ${status}`);
      }
    }

    // ---------- Seed Documents ----------
    for (const user of savedUsers) {
      const numDocs = Math.floor(Math.random() * 3) + 1; // 1-3 documents per user
      for (let i = 1; i <= numDocs; i++) {
        const doc = new Document({
          user: user._id,
          filename: `${user.name.replace(' ', '_')}_doc${i}.pdf`,
          url: `https://example.com/docs/${user.name.replace(' ', '_')}_doc${i}.pdf`
        });
        await doc.save();
        console.log(`Document created for: ${user.name} | File: ${doc.filename}`);
      }
    }

    console.log('Seeding complete with realistic data!');
    process.exit();
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
