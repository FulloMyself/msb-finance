// msb-backend/seedAdmin.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

async function run() {
  const MONGO = process.env.MONGO_URI;
  if (!MONGO) { console.error('Set MONGO_URI in .env'); process.exit(1); }
  await mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true });

  const email = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
  const exists = await Admin.findOne({ email });
  if (exists) {
    console.log('Admin already exists:', email);
    process.exit(0);
  }

  const password = process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!';
  const hashed = await bcrypt.hash(password, 10);
  const admin = await Admin.create({ name: 'Admin', email, password: hashed });
  console.log('Admin created:', admin.email);
  process.exit(0);
}
run().catch(err => { console.error(err); process.exit(1); });
