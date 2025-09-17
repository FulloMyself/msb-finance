require('dotenv').config();           // Load environment variables
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

const app = express();

// ----------------------
// Middleware
// ----------------------
app.use(cors({ origin: process.env.FRONTEND_URL || '*' })); // Restrict in prod
app.use(express.json());                                     // JSON parser

// ----------------------
// Routes
// ----------------------
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// ----------------------
// MongoDB Connection
// ----------------------
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/msbfinance';
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.log(err));

// ----------------------
// Global Error Handler
// ----------------------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server error' });
});

// ----------------------
// Start Server
// ----------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

