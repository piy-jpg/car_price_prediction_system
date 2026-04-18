const { getModels } = require("../lib/data");

module.exports = (req, res) => {
  const company = typeof req.query.company === "string" ? req.query.company : "";
  res.status(200).json({ models: getModels(company) });
};
