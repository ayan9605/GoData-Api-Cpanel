const Usage = require('../models/Usage');
const { DEFAULT_REQUEST_LIMIT, DEFAULT_STORAGE_LIMIT } = require('../config');

async function checkLimits(user) {
  let usage = await Usage.findOne({ user_id: user._id });
  if (!usage) {
    usage = await Usage.create({
      user_id: user._id,
      storage_used_bytes: 0,
      storage_limit_bytes: DEFAULT_STORAGE_LIMIT,
      requests_made: 0,
      request_limit: DEFAULT_REQUEST_LIMIT
    });
  }

  if (usage.requests_made >= (usage.request_limit || DEFAULT_REQUEST_LIMIT)) {
    return { allowed: false, error: 'Request limit exceeded' };
  }

  if (usage.storage_used_bytes >= (usage.storage_limit_bytes || DEFAULT_STORAGE_LIMIT)) {
    return { allowed: false, error: 'Storage limit exceeded' };
  }

  return { allowed: true, usage };
}

async function logUsage(user, requestSize = 0, responseSize = 0) {
  const usage = await Usage.findOne({ user_id: user._id });
  if (!usage) return;

  usage.requests_made += 1;
  usage.storage_used_bytes += requestSize + responseSize;

  await usage.save();
}

module.exports = { checkLimits, logUsage };