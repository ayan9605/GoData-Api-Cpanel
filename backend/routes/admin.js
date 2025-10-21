const express = require('express');
const crypto = require('crypto');
const User = require('../models/User');
const Backend = require('../models/Backend');
const Usage = require('../models/Usage');

const router = express.Router();

// 🛡️ Simple admin auth middleware
router.use((req, res, next) => {
  if (req.headers['x-admin-key'] !== process.env.ADMIN_KEY)
    return res.status(403).json({ error: 'Admin auth failed' });
  next();
});

//
// 🧩 USERS CRUD
//
router.get('/users', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// 🟢 Create new user with secure API key
router.post('/users', async (req, res) => {
  try {
    const { name, email, assigned_backend } = req.body;

    // Generate random secure API key
    const api_key = crypto.randomBytes(20).toString('hex');

    const user = new User({
      name,
      email,
      assigned_backend,
      api_key,
      storage_limit_bytes: 52428800, // 50 MB
      request_limit: 1000,
    });

    await user.save();

    // Create initial usage record
    await Usage.create({
      user_id: user._id,
      storage_used_bytes: 0,
      requests_made: 0,
      storage_limit_bytes: user.storage_limit_bytes,
      request_limit: user.request_limit,
    });

    res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/users/:id', async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

//
// 🧠 BACKENDS CRUD
//
router.get('/backends', async (req, res) => res.json(await Backend.find()));

router.post('/backends', async (req, res) => {
  const backend = await Backend.create(req.body);
  res.json(backend);
});

router.delete('/backends/:id', async (req, res) => {
  await Backend.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

//
// 📊 USAGE ANALYTICS
//
router.get('/usage', async (req, res) => res.json(await Usage.find()));

module.exports = router;