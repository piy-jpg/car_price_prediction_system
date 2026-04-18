const { getRecentPredictions } = require("../../lib/data");

module.exports = (req, res) => {
  const limit = Math.max(1, Math.min(50, Number(req.query.limit || 10)));
  res.status(200).json({ predictions: getRecentPredictions(limit) });
};
