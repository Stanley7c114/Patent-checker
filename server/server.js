import dotenv from "dotenv";
import express from "express";
import fs from "fs";
import cors from "cors";
import GeminiService from "./src/services/geminiService.js"; // Ensure the file extension is included

// Polyfill fetch globally
import fetch, { Headers } from "node-fetch";
globalThis.fetch = fetch;
globalThis.Headers = Headers;

dotenv.config();
const app = express();
const PORT = 3000;

// Load API key from environment variables
const geminiApiKey = process.env.GEMINI_API_KEY;
const geminiService = new GeminiService(geminiApiKey); // Initialize GeminiService

// CORS configuration
const corsOptions = {
  origin: "http://localhost:5173",
  methods: ["POST", "GET", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Accept"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Load data files
const patents = JSON.parse(fs.readFileSync("./src/data/patents.json", "utf8"));
const products = JSON.parse(
  fs.readFileSync("./src/data/company_products.json", "utf8")
);

const companyProducts = {};
products.companies.forEach((company) => {
  companyProducts[company.name] = company.products;
});

// Test endpoint to verify server is running
app.get("/test", (req, res) => {
  res.json({ message: "Server is running" });
});

// API route to handle infringement check
app.post("/api/infringement-check", async (req, res) => {
  // console.log("=== Infringement Check Request ===");
  // console.log("Headers:", req.headers);
  // console.log("Body:", req.body);
  const { patentId, companyName } = req.body;

  // Log input validation
  // console.log("Validating inputs:", { patentId, companyName });
  if (!patentId || !companyName) {
    console.log("Validation failed: missing required fields");
    return res
      .status(400)
      .json({ error: "Patent ID and Company Name are required" });
  }

  const patent = patents.find((p) => p.publication_number === patentId);

  const fullCompanyName = companyName.endsWith(" Inc.")
    ? companyName
    : `${companyName} Inc.`;
  const products = companyProducts[fullCompanyName];

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

  try {
    // Use GeminiService to analyze patent infringement
    const analysis = await geminiService.analyzePatentInfringement(
      patent,
      products
    );
    res.json(analysis);
  } catch (error) {
    console.error("Error during analysis:", error);
    res.status(500).json({ error: "Failed to analyze patent infringement" });
  }
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
