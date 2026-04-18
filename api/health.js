const { getDataset } = require("../lib/data");

module.exports = (req, res) => {
  const dataset = getDataset();
  res.status(200).json({
    status: "healthy",
    model_loaded: true,
    dataset_size: dataset.records.length,
  });
};
