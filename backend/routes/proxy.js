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

    // Check storage and request limits
    const limitCheck = await checkLimits(user);
    if (!limitCheck.allowed) return res.status(429).json({ error: limitCheck.error });

    // Get active assigned backend
    const backend = await Backend.findOne({ backend_name: user.assigned_backend, status: 'active' });
    if (!backend) return res.status(502).json({ error: 'Backend not available' });

    // Remove /proxy from path before forwarding
    const pathWithoutProxy = req.originalUrl.replace(/^\/proxy/, '');
    const url = `${backend.base_url}${pathWithoutProxy}`;

    // Forward request to backend
    const response = await axios({
      method: req.method.toLowerCase(),
      url,
      headers: { ...req.headers, host: undefined, 'x-api-key': undefined },
      data: req.body,
      timeout: 10000 // 10s timeout
    });

    // Calculate request and response sizes
    const requestSize = req.body ? Buffer.byteLength(JSON.stringify(req.body), 'utf8') : 0;
    const responseSize = response.data ? Buffer.byteLength(JSON.stringify(response.data), 'utf8') : 0;

    // Log usage
    await logUsage(user, requestSize, responseSize);
    await Log.create({
      user_id: user._id,
      action: req.method,
      collection: pathWithoutProxy,
      size_bytes: requestSize,
      response_status: response.status
    });

    res.status(response.status).json(response.data);

  } catch (err) {
    if (err.response) return res.status(err.response.status).json(err.response.data);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;