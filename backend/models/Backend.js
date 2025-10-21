const mongoose = require('mongoose');

const BackendSchema = new mongoose.Schema({
  backend_name: String,
  base_url: String,
  metadata: Object,
  status: { type: String, default: "active" }
}, { timestamps: true });

module.exports = mongoose.model('Backend', BackendSchema);