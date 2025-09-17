// msb-backend/seedAdmin.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { Admin } = require('./models/Admin');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.log(err));

async function seedAdmin() {
  const hashedPassword = await bcrypt.hash('AdminPassword123!', 10);
  const admin = new Admin({
    name: 'Super Admin',
    email: 'admin@msbfinance.com',
    password: hashedPassword
  });

  await admin.save();
  console.log("Admin account created");
  mongoose.disconnect();
}

seedAdmin();