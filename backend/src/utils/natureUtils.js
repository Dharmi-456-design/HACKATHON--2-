const mongoose = require('mongoose');
const { sanitizeText, sanitizeMultiline } = require('./sanitize');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const pick = (obj, keys) => {
  const out = {};
  for (const key of keys) {
    if (obj[key] !== undefined) out[key] = obj[key];
  }
  return out;
};

module.exports = { isValidId, pick, sanitizeText, sanitizeMultiline };
