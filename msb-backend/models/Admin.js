const mongoose = require('mongoose');
const AdminSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String
});
const Admin = mongoose.model('Admin', AdminSchema);
module.exports = { Admin };
