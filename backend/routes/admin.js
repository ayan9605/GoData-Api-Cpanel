const express = require('express');
const User = require('../models/User');
const Backend = require('../models/Backend');
const Usage = require('../models/Usage');

const router = express.Router();

// Simple admin auth middleware (replace with real auth)
router.use((req, res, next) => {
  if (req.headers['x-admin-key'] !== process.env.ADMIN_KEY) return res.status(403).json({ error: 'Admin auth failed' });
  next();
});

// Users CRUD
router.get('/users', async (req, res) => res.json(await User.find()));
router.post('/users', async (req, res) => res.json(await User.create(req.body)));
router.delete('/users/:id', async (req, res) => res.json(await User.findByIdAndDelete(req.params.id)));

// Backends CRUD
router.get('/backends', async (req, res) => res.json(await Backend.find()));
router.post('/backends', async (req, res) => res.json(await Backend.create(req.body)));
router.delete('/backends/:id', async (req, res) => res.json(await Backend.findByIdAndDelete(req.params.id)));

// Usage Analytics
router.get('/usage', async (req, res) => res.json(await Usage.find()));

module.exports = router;