const express = require("express");
const router = express.Router();
const PatentController = require("../controllers/patentController");
const patents = require("../data/patents.json");
const companies = require("../data/company_products.json");

const patentController = new PatentController(patents, companies);

router.post("/check-infringement", (req, res) => {
  patentController.checkInfringement(req, res);
});

module.exports = router;
