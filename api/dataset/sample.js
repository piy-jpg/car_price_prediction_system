const { getDataset, serializeRecord } = require("../../lib/data");

module.exports = (req, res) => {
  const limit = Math.max(1, Math.min(50, Number(req.query.limit || 10)));
  const sample = getDataset().records.slice(0, limit).map(serializeRecord);
  res.status(200).json({ sample });
};
