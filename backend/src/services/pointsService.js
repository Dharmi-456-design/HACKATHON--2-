const User = require('../models/User');

const POINTS_PER_RESOLUTION = 5;

const awardPoints = async (userId, points) => {
  await User.findByIdAndUpdate(userId, { $inc: { points } }, { new: true });
};

module.exports = { awardPoints, POINTS_PER_RESOLUTION };
