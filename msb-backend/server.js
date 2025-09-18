const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config(); // load .env

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const loansRoutes = require('./routes/loans');
const documentsRoutes = require('./routes/documents');


const app = express();

// ✅ Body parser
app.use(bodyParser.json());

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET','POST','PATCH','DELETE','OPTIONS'],
  credentials: true
}));

app.options('*', cors());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/loans', loansRoutes);
app.use('/api/docs', documentsRoutes);



// MongoDB connection
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.error("MongoDB connection error:", err));

// Listen on Render port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
