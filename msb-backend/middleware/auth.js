const jwt = require('jsonwebtoken');
const { User } = require('../models/User');
const { Admin } = require('../models/Admin');

// Protect routes for logged-in users
const protect = async (req, res, next) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'No token provided' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check if user or admin
        if (decoded.role === 'admin') {
            req.admin = await Admin.findById(decoded.id);
            if (!req.admin) return res.status(401).json({ message: 'Invalid admin token' });
        } else {
            req.user = await User.findById(decoded.id);
            if (!req.user) return res.status(401).json({ message: 'Invalid token' });
        }

        req.role = decoded.role;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

// Admin-only middleware
const adminOnly = (req, res, next) => {
    if (req.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access only' });
    }
    next();
};

module.exports = { protect, adminOnly };
