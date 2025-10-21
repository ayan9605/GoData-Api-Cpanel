const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  api_key: { type: String, unique: true },
  assigned_backend: String
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);