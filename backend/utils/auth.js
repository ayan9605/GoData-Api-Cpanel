const User = require('../models/User');

async function authenticate(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey) return res.status(401).json({ error: 'API key required' });

  const user = await User.findOne({ api_key: apiKey });
  if (!user) return res.status(403).json({ error: 'Invalid API key' });

  req.user = user;
  next();
}

module.exports = { authenticate };