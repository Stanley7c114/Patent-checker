const PatentService = require("../services/patentService");
const fs = require("fs");
const path = require("path");

class PatentController {
  constructor() {
    // Load data files
    const patentsData = JSON.parse(
      fs.readFileSync(path.join(__dirname, "../data/patents.json"), "utf8")
    );
    const companiesData = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, "../data/company_products.json"),
        "utf8"
      )
    );

    this.patentService = new PatentService(patentsData, companiesData);
  }

  async checkInfringement(req, res) {
    try {
      const { patentId, companyName } = req.body;
      console.log("Received request:", { patentId, companyName }); // Debug log

      const patent = this.patentService.findPatentById(patentId);
      if (!patent) {
        console.log("Patent not found:", patentId); // Debug log
        return res.status(404).json({ error: "Patent not found" });
      }

      const company = this.patentService.findCompanyByName(companyName);
      if (!company) {
        console.log("Company not found:", companyName); // Debug log
        return res.status(404).json({ error: "Company not found" });
      }

      // Call the Gemini API to get infringement analysis
      const results = await this.patentService.getInfringementAnalysis(
        patent,
        company
      );

      console.log("Sending results:", results); // Debug log
      res.json(results);
    } catch (error) {
      console.error("Error in checkInfringement:", error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = PatentController;
