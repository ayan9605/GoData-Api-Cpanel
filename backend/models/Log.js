const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: String,
  collection: String,
  size_bytes: Number,
  timestamp: { type: Date, default: Date.now },
  response_status: Number
});

module.exports = mongoose.model('Log', LogSchema);