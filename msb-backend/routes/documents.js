const express = require('express');
const router = express.Router();
const upload = require('../utils/storage');
const { protect } = require('../middleware/auth');
const Document = require('../models/Document');

// single/multiple upload field name: files
router.post('/upload', protect, upload.array('files', 6), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) return res.status(400).json({ message: 'No files uploaded' });

    const saved = [];

    for (const f of req.files) {
      // For S3 multerS3 returns f.location; for disk storage it's f.path
      const url = f.location || (`${process.env.SERVER_URL || ''}/uploads/${f.filename}`);
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
    console.error(err);
    res.status(500).json({ message: 'Upload failed' });
  }
});

// GET /api/docs/me
router.get('/me', protect, async (req, res) => {
  const docs = await Document.find({ user: req.user._id }).sort({ uploadedAt: -1 });
  res.json({ docs });
});

// alias: GET /api/docs
router.get('/', protect, async (req, res) => {
  const docs = await Document.find({ user: req.user._id }).sort({ uploadedAt: -1 });
  res.json({ docs });
});


module.exports = router;
