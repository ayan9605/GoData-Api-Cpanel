const mongoose = require('mongoose');

const UsageSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  storage_used_bytes: { type: Number, default: 0 },
  requests_made: { type: Number, default: 0 },
  storage_limit_bytes: Number,
  request_limit: Number
}, { timestamps: true });

module.exports = mongoose.model('Usage', UsageSchema);