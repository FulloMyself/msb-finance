const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

const JWT_SECRET = process.env.JWT_SECRET || 'CHANGE_THIS_IN_PROD';

async function protect(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) return res.status(401).json({ message: 'No token provided' });

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.role === 'admin') {
      const admin = await Admin.findById(decoded.id).select('-password');
      if (!admin) return res.status(401).json({ message: 'Invalid token' });
      req.user = admin;
      req.user.role = 'admin';
    } else {
      const user = await User.findById(decoded.id).select('-password');
      if (!user) return res.status(401).json({ message: 'Invalid token' });
      req.user = user;
      req.user.role = 'user';
    }

    next();
  } catch (err) {
    console.error('Auth protect error:', err);
    res.status(401).json({ message: 'Invalid token' });
  }
}

function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access only' });
  }
  next();
}

module.exports = { protect, adminOnly };
