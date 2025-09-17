// middleware/admin.js

// This middleware assumes `protect` has already run and set `req.admin` if the user is an admin
const adminOnly = (req, res, next) => {
    if (!req.admin) {
        return res.status(403).json({ message: 'Admin access required' });
    }

    // Admin is authenticated
    next();
};

module.exports = { adminOnly };
