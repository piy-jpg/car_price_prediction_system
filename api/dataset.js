const { getDataset, serializeRecord } = require("../lib/data");

module.exports = (req, res) => {
  const records = getDataset().records.map(serializeRecord);
  res.status(200).json({
    records,
    total: records.length,
  });
};
