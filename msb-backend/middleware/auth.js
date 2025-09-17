const jwt = require('jsonwebtoken');
const { User } = require('../models/User');
const { Admin } = require('../models/Admin');

// Protect routes for users or admins
const protect = async (req, res, next) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Determine if token is user or admin
    if (decoded.role === 'admin') {
      const admin = await Admin.findById(decoded.id);
      if (!admin) return res.status(401).json({ message: 'Unauthorized' });
      req.admin = admin;
      req.user = null; // make it explicit
    } else {
      const user = await User.findById(decoded.id);
      if (!user) return res.status(401).json({ message: 'Invalid token' });
      req.user = user;
      req.admin = null;
    }

    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Check if logged-in user is admin
const adminOnly = (req, res, next) => {
  if (!req.admin) return res.status(403).json({ message: 'Admin access required' });
  next();
};

module.exports = { protect, adminOnly };
