const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: 'user' }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = { User };  // <- must export { User }, not just User
