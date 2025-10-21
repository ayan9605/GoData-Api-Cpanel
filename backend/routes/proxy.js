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
    // Remove '/proxy' from the path before sending to backend
    const pathWithoutProxy = req.originalUrl.replace(/^\/proxy/, '');
    const url = `${backend.base_url}${pathWithoutProxy}`;

    const response = await axios({
      method: req.method.toLowerCase(),
      url,
      headers: { ...req.headers, host: undefined, 'x-api-key': undefined }, // remove API key before forwarding
      data: req.body,
      timeout: 10000 // 10 seconds
    });

    // Log usage
    const size = JSON.stringify(response.data).length;
    await logUsage(user, size);
    await Log.create({
      user_id: user._id,
      action: req.method,
      collection: pathWithoutProxy,
      size_bytes: size,
      response_status: response.status
    });

    res.status(response.status).json(response.data);
  } catch (err) {
    // If backend responds with 404 or 400, pass the response
    if (err.response) return res.status(err.response.status).json(err.response.data);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;