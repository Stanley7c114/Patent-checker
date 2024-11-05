const express = require("express");
const fs = require("fs");
const cors = require("cors");
const app = express();
const PORT = 5001;

// CORS configuration
const corsOptions = {
  origin: "http://localhost:3000",
  methods: ["POST", "GET", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Accept"],
  credentials: true,
  optionsSuccessStatus: 200,
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Parse JSON bodies
app.use(express.json());

// Add this near the top, after initializing express but before routes
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Load data files
const patents = JSON.parse(fs.readFileSync("./data/patents.json", "utf8"));
const products = JSON.parse(
  fs.readFileSync("./src/company_products.json", "utf8")
);

// Create a mapping of company products for easier lookup
const companyProducts = {};
products.companies.forEach((company) => {
  companyProducts[company.name] = company.products;
});

// After loading the data files
console.log(
  "Available Patent IDs:",
  patents.map((p) => p.id)
);
console.log("Available Companies:", Object.keys(companyProducts));

// Test endpoint to verify server is running
app.get("/test", (req, res) => {
  res.json({ message: "Server is running" });
});

// API route to handle infringement check
app.post("/infringement-check", express.json(), (req, res) => {
  console.log("=== Infringement Check Request ===");
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);
  const { patentId, companyName } = req.body;

  // Log input validation
  console.log("Validating inputs:", { patentId, companyName });
  if (!patentId || !companyName) {
    console.log("Validation failed: missing required fields");
    return res
      .status(400)
      .json({ error: "Patent ID and Company Name are required" });
  }

  // Log data lookup
  console.log("Looking up patent:", patentId);
  console.log("Patents array length:", patents.length);
  const patent = patents.find((p) => p.publication_number === patentId);

  console.log("Looking up company:", companyName);
  console.log("Available companies:", Object.keys(companyProducts));
  const fullCompanyName = companyName.endsWith(" Inc.")
    ? companyName
    : `${companyName} Inc.`;
  const products = companyProducts[fullCompanyName];

  console.log("Found patent:", patent ? "Yes" : "No");
  console.log("Found products:", products ? "Yes" : "No");

  if (!patent || !products) {
    console.log("Not found error - Patent:", !patent, "Products:", !products);
    return res.status(404).json({
      error: `Not found. Please check:
      1. Patent ID should be in format "US-XXXXXXXX-XX" 
      2. Company name should be one of: ${Object.keys(companyProducts).join(
        ", "
      )}`,
    });
  }

  // Placeholder for infringement logic
  const topInfringingProducts = []; // Will contain top 2 products later

  const response = {
    analysis_id: "1",
    patent_id: patentId,
    company_name: companyName,
    analysis_date: new Date().toISOString(),
    top_infringing_products: topInfringingProducts,
    overall_risk_assessment: "Low (to be calculated)",
  };

  console.log("Sending response:", response);
  res.json(response);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something broke!" });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log("Available routes:");
  console.log("- GET /test");
  console.log("- POST /infringement-check");
});
