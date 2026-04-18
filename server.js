const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");
const { predictPrice } = require("./lib/data");

const HOST = "127.0.0.1";
const PORT = Number(process.env.PORT || 3000);
const ROOT_DIR = __dirname;
const FRONTEND_DIR = path.join(ROOT_DIR, "frontend");
const CSV_PATH = path.join(ROOT_DIR, "Cleaned_Car_data.csv");
const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(JSON.stringify(payload));
}

function sendText(res, statusCode, payload, contentType = "text/plain; charset=utf-8") {
  res.writeHead(statusCode, { "Content-Type": contentType });
  res.end(payload);
}

function parseCsvLine(line) {
  const values = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === '"') {
      if (inQuotes && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current);
  return values;
}

function loadDataset() {
  const rawCsv = fs.readFileSync(CSV_PATH, "utf8").trim();
  const lines = rawCsv.split(/\r?\n/);
  const headers = parseCsvLine(lines[0]);
  const records = lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    return headers.reduce((record, header, index) => {
      record[header] = values[index] ?? "";
      return record;
    }, {});
  });

  const companies = new Set();
  const modelsByCompany = new Map();
  const years = new Set();
  const fuelTypes = new Set();
  let minPrice = Number.POSITIVE_INFINITY;
  let maxPrice = Number.NEGATIVE_INFINITY;
  let totalPrice = 0;

  for (const record of records) {
    const company = record.company;
    const name = record.name;
    const year = Number(record.year);
    const fuelType = record.fuel_type;
    const price = Number(record.Price);

    companies.add(company);
    years.add(year);
    fuelTypes.add(fuelType);
    totalPrice += price;
    minPrice = Math.min(minPrice, price);
    maxPrice = Math.max(maxPrice, price);

    if (!modelsByCompany.has(company)) {
      modelsByCompany.set(company, new Set());
    }
    modelsByCompany.get(company).add(name);
  }

  const sortedCompanies = [...companies].sort();
  const sortedYears = [...years].sort((left, right) => right - left);
  const sortedFuelTypes = [...fuelTypes].sort();
  const serializedModels = {};

  for (const [company, models] of modelsByCompany.entries()) {
    serializedModels[company] = [...models].sort();
  }

  return {
    records,
    companies: sortedCompanies,
    years: sortedYears,
    fuelTypes: sortedFuelTypes,
    modelsByCompany: serializedModels,
    stats: {
      total_cars: records.length,
      companies: sortedCompanies.length,
      models: new Set(records.map((record) => record.name)).size,
      year_range: {
        min: Math.min(...sortedYears),
        max: Math.max(...sortedYears),
      },
      price_range: {
        min: minPrice,
        max: maxPrice,
        mean: records.length ? totalPrice / records.length : 0,
      },
    },
  };
}

const dataset = loadDataset();
const recentPredictions = [];

function formatPriceLabel(price) {
  const value = Number(price) || 0;
  return `Rs ${(value / 100000).toFixed(1)}L`;
}

function buildPriceBuckets(records) {
  const buckets = [
    { label: "0-5L", min: 0, max: 500000 },
    { label: "5-10L", min: 500000, max: 1000000 },
    { label: "10-20L", min: 1000000, max: 2000000 },
    { label: "20-50L", min: 2000000, max: 5000000 },
    { label: "50L+", min: 5000000, max: Number.POSITIVE_INFINITY },
  ];

  return buckets.map((bucket) => ({
    label: bucket.label,
    count: records.filter((record) => {
      const price = Number(record.Price);
      return price >= bucket.min && price < bucket.max;
    }).length,
  }));
}

function buildCompanyDistribution(records, limit = 10) {
  const counts = new Map();
  for (const record of records) {
    counts.set(record.company, (counts.get(record.company) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, count]) => ({ label, count }));
}

function buildFuelDistribution(records) {
  const counts = new Map();
  for (const record of records) {
    counts.set(record.fuel_type, (counts.get(record.fuel_type) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([label, count]) => ({ label, count }));
}

function buildYearlyAveragePrices(records, limit = 10) {
  const grouped = new Map();
  for (const record of records) {
    const year = Number(record.year);
    const price = Number(record.Price);
    if (!grouped.has(year)) grouped.set(year, []);
    grouped.get(year).push(price);
  }
  return [...grouped.entries()]
    .sort((a, b) => a[0] - b[0])
    .slice(-limit)
    .map(([year, prices]) => ({
      year,
      average_price: prices.reduce((sum, price) => sum + price, 0) / prices.length,
    }));
}

function buildAnalyticsSnapshot() {
  const records = dataset.records.map(serializeRecord);
  const topCompanies = buildCompanyDistribution(records, 5);
  const fuelDistribution = buildFuelDistribution(records);
  const yearlyAveragePrices = buildYearlyAveragePrices(records, 8);
  const recent = recentPredictions.slice(0, 20);
  const avgResponseTimeMs = recent.length
    ? recent.reduce((sum, item) => sum + (item.response_time_ms || 0), 0) / recent.length
    : 0;
  const exactMatches = recent.filter((item) => item.match_type === "exact").length;
  const exactMatchRate = recent.length ? (exactMatches / recent.length) * 100 : 0;

  return {
    summary: {
      total_cars: records.length,
      companies: dataset.companies.length,
      models: dataset.stats.models,
      average_price: dataset.stats.price_range.mean,
      avg_response_time_ms: avgResponseTimeMs,
      recent_predictions: recent.length,
      exact_match_rate: exactMatchRate,
    },
    price_distribution: buildPriceBuckets(records),
    company_distribution: buildCompanyDistribution(records, 10),
    fuel_distribution: fuelDistribution,
    yearly_average_prices: yearlyAveragePrices,
    market_insights: [
      {
        metric: "Average Price",
        value: formatPriceLabel(dataset.stats.price_range.mean),
        trend: "Dataset average",
        change: `${records.length} vehicles`,
      },
      {
        metric: "Top Brand",
        value: topCompanies[0] ? topCompanies[0].label : "N/A",
        trend: "Highest inventory",
        change: topCompanies[0] ? `${topCompanies[0].count} cars` : "0 cars",
      },
      {
        metric: "Popular Fuel",
        value: fuelDistribution[0] ? fuelDistribution[0].label : "N/A",
        trend: "Largest share",
        change: fuelDistribution[0] ? `${fuelDistribution[0].count} cars` : "0 cars",
      },
    ],
    report_metrics: [
      {
        metric: "Recent Predictions",
        current: String(recent.length),
        previous: "-",
        change: recent.length ? `${recent.filter((item) => item.match_type === "exact").length} exact` : "No activity",
        trend: recent.length ? "Active" : "Idle",
      },
      {
        metric: "Avg Response Time",
        current: `${(avgResponseTimeMs / 1000).toFixed(2)}s`,
        previous: "-",
        change: recent.length ? `${recent.length} calls tracked` : "No activity",
        trend: avgResponseTimeMs < 1000 ? "Fast" : "Normal",
      },
      {
        metric: "Exact Match Rate",
        current: `${exactMatchRate.toFixed(1)}%`,
        previous: "-",
        change: recent.length ? `${exactMatches}/${recent.length}` : "No activity",
        trend: exactMatchRate >= 70 ? "Strong" : "Mixed",
      },
    ],
    recent_predictions: recent,
  };
}

function estimateConfidence(matchType, matchedRecords) {
  const base = {
    exact: 98,
    same_model_year: 92,
    same_model_fuel: 88,
    same_model: 82,
    same_company: 70,
    fallback: 65,
  }[matchType] || 60;
  return Math.min(99, base + Math.min(4, Math.max(0, matchedRecords - 1)));
}

function serializeRecord(record) {
  return {
    ...record,
    year: Number(record.year),
    kms_driven: Number(record.kms_driven),
    Price: Number(record.Price),
  };
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString("utf8");
      if (body.length > 1_000_000) {
        reject(new Error("Request body too large"));
        req.destroy();
      }
    });

    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function serveStaticFile(reqPath, res) {
  const safePath = path.normalize(reqPath).replace(/^(\.\.[/\\])+/, "");
  const requestedPath = safePath === "/" ? "/index.html" : safePath;
  const filePath = path.join(FRONTEND_DIR, requestedPath);

  if (!filePath.startsWith(FRONTEND_DIR)) {
    sendText(res, 403, "Forbidden");
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === "ENOENT") {
        sendText(res, 404, "Not found");
        return;
      }
      sendText(res, 500, "Failed to read file");
      return;
    }

    const extension = path.extname(filePath).toLowerCase();
    sendText(res, 200, content, MIME_TYPES[extension] || "application/octet-stream");
  });
}

async function handleApiRequest(req, res, url) {
  if (req.method === "OPTIONS") {
    sendJson(res, 204, {});
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/health") {
    sendJson(res, 200, {
      status: "healthy",
      model_loaded: true,
      dataset_size: dataset.records.length,
    });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/companies") {
    sendJson(res, 200, { companies: dataset.companies });
    return;
  }

  if (
    req.method === "GET" &&
    (url.pathname === "/api/models" || url.pathname.startsWith("/api/models/"))
  ) {
    const company = url.pathname === "/api/models"
      ? decodeURIComponent(url.searchParams.get("company") || "")
      : decodeURIComponent(url.pathname.replace("/api/models/", ""));
    sendJson(res, 200, { models: dataset.modelsByCompany[company] || [] });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/years") {
    sendJson(res, 200, { years: dataset.years });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/fuel_types") {
    sendJson(res, 200, { fuel_types: dataset.fuelTypes });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/stats") {
    sendJson(res, 200, dataset.stats);
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/analytics/overview") {
    sendJson(res, 200, buildAnalyticsSnapshot());
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/predictions/recent") {
    const limit = Math.max(1, Math.min(50, Number(url.searchParams.get("limit") || 10)));
    sendJson(res, 200, { predictions: recentPredictions.slice(0, limit) });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/dataset") {
    const records = dataset.records.map(serializeRecord);
    sendJson(res, 200, {
      records,
      total: records.length,
    });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/dataset/sample") {
    const limit = Math.max(1, Math.min(50, Number(url.searchParams.get("limit") || 10)));
    const sample = dataset.records.slice(0, limit).map(serializeRecord);
    sendJson(res, 200, { sample });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/predict") {
    try {
      const startedAt = Date.now();
      const rawBody = await readBody(req);
      const payload = rawBody ? JSON.parse(rawBody) : {};
      const result = predictPrice(payload);
      const responseTimeMs = Date.now() - startedAt;
      const predictionEntry = {
        ...result.recent_entry,
        response_time_ms: responseTimeMs,
      };
      recentPredictions.unshift(predictionEntry);
      if (recentPredictions.length > 100) recentPredictions.length = 100;
      result.recent_entry = predictionEntry;
      sendJson(res, 200, result);
    } catch (error) {
      sendJson(res, 500, {
        success: false,
        error: "Prediction failed",
        details: error.message,
      });
    }
    return;
  }

  sendJson(res, 404, { error: "Route not found" });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || `localhost:${PORT}`}`);

  if (url.pathname.startsWith("/api/")) {
    await handleApiRequest(req, res, url);
    return;
  }

  const requestedPath = url.pathname === "/" ? "/index.html" : url.pathname;
  serveStaticFile(requestedPath, res);
});

server.listen(PORT, HOST, () => {
  console.log(`Car price predictor server running at http://localhost:${PORT}`);
});
