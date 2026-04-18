const { getAnalyticsOverview } = require("../../lib/data");

module.exports = (req, res) => {
  res.status(200).json(getAnalyticsOverview());
};
