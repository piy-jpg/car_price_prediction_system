const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.join(__dirname, "..");
const CSV_PATH = path.join(ROOT_DIR, "Cleaned_Car_data.csv");

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

function formatPriceInr(price) {
  if (price >= 10000000) {
    const crores = price / 10000000;
    return crores >= 10 ? `${crores.toFixed(1)} crore` : `${crores.toFixed(2)} crore`;
  }
  if (price >= 100000) {
    const lakhs = price / 100000;
    return lakhs >= 10 ? `${lakhs.toFixed(0)} lakh` : `${lakhs.toFixed(1)} lakh`;
  }
  return `Rs ${price.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

function formatPriceLabel(price) {
  const value = Number(price) || 0;
  return `Rs ${(value / 100000).toFixed(1)}L`;
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

function median(values) {
  if (!values.length) return 0;
  const sorted = [...values].sort((left, right) => left - right);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

function serializeRecord(record) {
  return {
    ...record,
    year: Number(record.year),
    kms_driven: Number(record.kms_driven),
    Price: Number(record.Price),
  };
}

function loadDataset() {
  const rawCsv = fs.readFileSync(CSV_PATH, "utf8").trim();
  const lines = rawCsv.split(/\r?\n/);
  const headers = parseCsvLine(lines[0]);
  const records = lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const record = headers.reduce((current, header, index) => {
      current[header] = values[index] ?? "";
      return current;
    }, {});

    record.year = Number(record.year);
    record.kms_driven = Number(record.kms_driven);
    record.Price = Number(record.Price);
    record.company_key = String(record.company).trim().toLowerCase();
    record.name_key = String(record.name).trim().toLowerCase();
    record.fuel_key = String(record.fuel_type).trim().toLowerCase();
    return record;
  });

  const companies = new Set();
  const modelsByCompany = new Map();
  const years = new Set();
  const fuelTypes = new Set();
  let minPrice = Number.POSITIVE_INFINITY;
  let maxPrice = Number.NEGATIVE_INFINITY;
  let totalPrice = 0;

  for (const record of records) {
    companies.add(record.company);
    years.add(record.year);
    fuelTypes.add(record.fuel_type);
    totalPrice += record.Price;
    minPrice = Math.min(minPrice, record.Price);
    maxPrice = Math.max(maxPrice, record.Price);

    if (!modelsByCompany.has(record.company)) {
      modelsByCompany.set(record.company, new Set());
    }
    modelsByCompany.get(record.company).add(record.name);
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

function getState() {
  if (!global.__carPricePredictorState) {
    global.__carPricePredictorState = {
      dataset: loadDataset(),
      recentPredictions: [],
    };
  }

  return global.__carPricePredictorState;
}

function getDataset() {
  return getState().dataset;
}

function getCompanies() {
  return getDataset().companies;
}

function getModels(company) {
  return getDataset().modelsByCompany[company] || [];
}

function getYears() {
  return getDataset().years;
}

function getFuelTypes() {
  return getDataset().fuelTypes;
}

function getStats() {
  return getDataset().stats;
}

function getRecentPredictions(limit = 10) {
  return getState().recentPredictions.slice(0, limit);
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
    count: records.filter((record) => record.Price >= bucket.min && record.Price < bucket.max).length,
  }));
}

function buildCompanyDistribution(records, limit = 10) {
  const counts = new Map();
  for (const record of records) {
    counts.set(record.company, (counts.get(record.company) || 0) + 1);
  }

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, limit)
    .map(([label, count]) => ({ label, count }));
}

function buildFuelDistribution(records) {
  const counts = new Map();
  for (const record of records) {
    counts.set(record.fuel_type, (counts.get(record.fuel_type) || 0) + 1);
  }

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .map(([label, count]) => ({ label, count }));
}

function buildYearlyAveragePrices(records, limit = 10) {
  const grouped = new Map();
  for (const record of records) {
    if (!grouped.has(record.year)) grouped.set(record.year, []);
    grouped.get(record.year).push(record.Price);
  }

  return [...grouped.entries()]
    .sort((left, right) => left[0] - right[0])
    .slice(-limit)
    .map(([year, prices]) => ({
      year,
      average_price: prices.reduce((sum, value) => sum + value, 0) / prices.length,
    }));
}

function getAnalyticsOverview() {
  const dataset = getDataset();
  const records = dataset.records.map(serializeRecord);
  const topCompanies = buildCompanyDistribution(records, 5);
  const fuelDistribution = buildFuelDistribution(records);
  const yearlyAveragePrices = buildYearlyAveragePrices(records, 8);
  const recent = getRecentPredictions(20);
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
        change: recent.length ? `${exactMatches} exact` : "No activity",
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

function predictPrice(payload) {
  const requiredFields = ["company", "car_model", "year", "kilo_driven", "fuel_type"];
  const missing = requiredFields.filter((field) => payload[field] === "" || payload[field] === undefined || payload[field] === null);
  if (missing.length) {
    throw new Error(`Missing field(s): ${missing.join(", ")}`);
  }

  const company = String(payload.company).trim();
  const carModel = String(payload.car_model).trim();
  const year = Number(payload.year);
  const kiloDriven = Number(payload.kilo_driven);
  const fuelType = String(payload.fuel_type).trim();
  const companyKey = company.toLowerCase();
  const modelKey = carModel.toLowerCase();
  const fuelKey = fuelType.toLowerCase();
  const dataset = getDataset().records;

  const exactMatches = dataset.filter((record) =>
    record.company_key === companyKey &&
    record.name_key === modelKey &&
    record.year === year &&
    record.fuel_key === fuelKey
  );

  let matchType = "fallback";
  let matchedRecords = 0;
  let candidates = [];

  if (exactMatches.length) {
    candidates = [...exactMatches]
      .sort((left, right) => Math.abs(left.kms_driven - kiloDriven) - Math.abs(right.kms_driven - kiloDriven))
      .slice(0, 3);
    matchType = "exact";
    matchedRecords = exactMatches.length;
  } else {
    const fallbackSets = [
      {
        type: "same_model_year",
        records: dataset.filter((record) =>
          record.company_key === companyKey &&
          record.name_key === modelKey &&
          record.year === year
        ),
      },
      {
        type: "same_model_fuel",
        records: dataset.filter((record) =>
          record.company_key === companyKey &&
          record.name_key === modelKey &&
          record.fuel_key === fuelKey
        ),
      },
      {
        type: "same_model",
        records: dataset.filter((record) =>
          record.company_key === companyKey &&
          record.name_key === modelKey
        ),
      },
      {
        type: "same_company",
        records: dataset.filter((record) => record.company_key === companyKey),
      },
    ];

    const fallback = fallbackSets.find((entry) => entry.records.length);
    if (!fallback) {
      throw new Error("No matching car records found in the original dataset");
    }

    matchType = fallback.type;
    matchedRecords = fallback.records.length;
    candidates = [...fallback.records]
      .sort((left, right) => {
        const yearGap = Math.abs(left.year - year) - Math.abs(right.year - year);
        if (yearGap !== 0) return yearGap;
        return Math.abs(left.kms_driven - kiloDriven) - Math.abs(right.kms_driven - kiloDriven);
      })
      .slice(0, 5);
  }

  const price = median(candidates.map((record) => record.Price));
  const response = {
    success: true,
    predicted_price: formatPriceInr(price),
    actual_price: `Rs ${price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    price_numeric: price,
    input_data: {
      company,
      model: carModel,
      year,
      kilometers_driven: kiloDriven,
      fuel_type: fuelType,
    },
    price_source: "original_dataset",
    match_type: matchType,
    matched_records: matchedRecords,
  };

  const entry = {
    timestamp: new Date().toISOString(),
    company,
    model: carModel,
    year,
    kilometers: kiloDriven,
    fuel_type: fuelType,
    predicted_price: response.predicted_price,
    actual_price: response.actual_price,
    price_numeric: response.price_numeric,
    match_type: matchType,
    matched_records: matchedRecords,
    confidence: estimateConfidence(matchType, matchedRecords),
    response_time_ms: 0,
  };

  response.recent_entry = entry;
  return response;
}

function storePrediction(entry) {
  const state = getState();
  state.recentPredictions.unshift(entry);
  if (state.recentPredictions.length > 100) {
    state.recentPredictions.length = 100;
  }
}

module.exports = {
  getAnalyticsOverview,
  getCompanies,
  getFuelTypes,
  getModels,
  getRecentPredictions,
  getStats,
  getYears,
  predictPrice,
  serializeRecord,
  storePrediction,
  getDataset,
};
