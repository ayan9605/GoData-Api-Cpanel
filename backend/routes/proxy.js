const express = require('express');
const axios = require('axios');
const { authenticate } = require('../utils/auth');
const { checkLimits, logUsage } = require('../utils/limits');
const Backend = require('../models/Backend');
const Log = require('../models/Log');

const router = express.Router();

router.use(authenticate);

router.all('/*', async (req, res) => {
  try {
    const user = req.user;

    // Check limits
    const limitCheck = await checkLimits(user);
    if (!limitCheck.allowed) return res.status(429).json({ error: limitCheck.error });

    // Get assigned backend
    const backend = await Backend.findOne({ backend_name: user.assigned_backend, status: 'active' });
    if (!backend) return res.status(502).json({ error: 'Backend not available' });

    // Forward request
    const url = `${backend.base_url}${req.originalUrl}`;
    const method = req.method.toLowerCase();

    const response = await axios({
      method,
      url,
      headers: { ...req.headers, 'host': undefined },
      data: req.body
    });

    // Log usage
    const size = JSON.stringify(response.data).length;
    await logUsage(user, size);
    await Log.create({
      user_id: user._id,
      action: req.method,
      collection: req.originalUrl,
      size_bytes: size,
      response_status: response.status
    });

    res.status(response.status).json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;