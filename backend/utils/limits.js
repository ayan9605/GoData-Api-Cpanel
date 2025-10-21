const Usage = require('../models/Usage');
const { DEFAULT_REQUEST_LIMIT, DEFAULT_STORAGE_LIMIT } = require('../config');

async function checkLimits(user) {
  let usage = await Usage.findOne({ user_id: user._id });
  if (!usage) {
    usage = await Usage.create({
      user_id: user._id,
      storage_limit_bytes: DEFAULT_STORAGE_LIMIT,
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

async function logUsage(user, size = 0) {
  const usage = await Usage.findOne({ user_id: user._id });
  usage.requests_made += 1;
  usage.storage_used_bytes += size;
  await usage.save();
}

module.exports = { checkLimits, logUsage };