const { predictPrice, storePrediction } = require("../lib/data");

module.exports = (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ success: false, error: "Method not allowed" });
    return;
  }

  try {
    const startedAt = Date.now();
    const result = predictPrice(req.body || {});
    result.recent_entry.response_time_ms = Date.now() - startedAt;
    storePrediction(result.recent_entry);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Prediction failed",
      details: error.message,
    });
  }
};
