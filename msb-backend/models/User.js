const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    phone: String,
    password: String,
    createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', UserSchema);
module.exports = { User };
