const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  filename: String,
  url: String,
  mimeType: String,
  size: Number,
  uploadedAt: { type: Date, default: Date.now }
});

const Document = mongoose.model('Document', DocumentSchema);
module.exports = Document;
