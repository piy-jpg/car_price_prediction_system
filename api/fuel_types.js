const { getFuelTypes } = require("../lib/data");

module.exports = (req, res) => {
  res.status(200).json({ fuel_types: getFuelTypes() });
};
