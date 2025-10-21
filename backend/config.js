require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3000,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/dynamic_proxy',
  DEFAULT_REQUEST_LIMIT: 1000,
  DEFAULT_STORAGE_LIMIT: 104857600 // 100 MB
};