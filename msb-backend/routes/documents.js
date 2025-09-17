const express = require('express');
const router = express.Router();
const upload = require('../utils/storage');
const { protect, adminOnly } = require('../middleware/auth');
const { Document } = require('../models/Document');

// -----------------------------
// User routes
// -----------------------------

// POST /api/docs/upload - upload files for logged-in user
router.post('/upload', protect, upload.array('files', 6), async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
        if (!req.files || req.files.length === 0)
            return res.status(400).json({ message: 'No files uploaded' });

        const saved = [];

        for (const f of req.files) {
            const url = f.location || `${process.env.SERVER_URL || ''}/uploads/${f.filename}`;
            const doc = await Document.create({
                user: req.user._id,
                filename: f.originalname,
                url,
                mimeType: f.mimetype,
                size: f.size
            });
            saved.push(doc);
        }

        res.json({ uploaded: saved });
    } catch (err) {
        console.error('File upload error:', err);
        res.status(500).json({ message: 'Upload failed' });
    }
});

// GET /api/docs/me - get documents of logged-in user
router.get('/me', protect, async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

        const docs = await Document.find({ user: req.user._id }).sort({ uploadedAt: -1 });
        res.json({ docs });
    } catch (err) {
        console.error('Fetching user documents error:', err);
        res.status(500).json({ message: 'Failed to fetch documents' });
    }
});

// GET /api/docs - alias for logged-in user's documents
router.get('/', protect, async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

        const docs = await Document.find({ user: req.user._id }).sort({ uploadedAt: -1 });
        res.json({ docs });
    } catch (err) {
        console.error('Fetching documents error:', err);
        res.status(500).json({ message: 'Failed to fetch documents' });
    }
});

// -----------------------------
// Admin route
// -----------------------------

// GET /api/docs/all - get all documents (admin only)
router.get('/all', protect, adminOnly, async (req, res) => {
    try {
        const docs = await Document.find().populate('user', 'name email').sort({ uploadedAt: -1 });
        res.json({ docs });
    } catch (err) {
        console.error('Admin fetching all documents error:', err);
        res.status(500).json({ message: 'Failed to fetch documents' });
    }
});

module.exports = router;
