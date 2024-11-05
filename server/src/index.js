const express = require("express");
const cors = require("cors");
const patentRoutes = require("./routes/patentRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Test route for root URL
app.get("/", (req, res) => {
  res.json({ message: "Patent Checker API is running!" });
});

// API routes
app.use("/api", patentRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
