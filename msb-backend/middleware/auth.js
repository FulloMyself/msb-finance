// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // your user model

// Protect routes for logged-in users
const protect = async (req, res, next) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'No token provided' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) return res.status(401).json({ message: 'Unauthorized' });

        req.user = user;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

// Optional: admin auth (if needed)
const adminAuth = async (req, res, next) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'No token provided' });

        const { Admin } = require('../models/Admin'); // your admin model
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const admin = await Admin.findById(decoded.id);
        if (!admin) return res.status(401).json({ message: 'Unauthorized' });

        req.admin = admin;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

// Export the middlewares
module.exports = { protect, adminAuth };
