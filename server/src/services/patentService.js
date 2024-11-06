const fuzzysort = require("fuzzysort");
const axios = require("axios");

class PatentService {
  constructor(patentsData, companiesData) {
    this.patents = patentsData;
    this.companies = companiesData.companies;
  }

  findPatentById(patentId) {
    return this.patents.find(
      (patent) =>
        patent.publication_number.toLowerCase() === patentId.toLowerCase()
    );
  }

  findCompanyByName(companyName) {
    return this.companies.find(
      (company) => company.name.toLowerCase() === companyName.toLowerCase()
    );
  }

  calculateClaimMatch(claimText, productDescription) {
    // Convert to lowercase and split into words
    const claimWords = new Set(claimText.toLowerCase().split(/\W+/));
    const productWords = new Set(productDescription.toLowerCase().split(/\W+/));

    // Calculate intersection
    const intersection = new Set(
      [...claimWords].filter((x) => productWords.has(x))
    );

    // Calculate Jaccard similarity
    const union = new Set([...claimWords, ...productWords]);
    return intersection.size / union.size;
  }

  async getInfringementAnalysis(patent, company) {
    try {
      console.log("Sending request to Gemini API with:", {
        patentId: patent.publication_number,
        companyName: company.name,
      });
      const response = await axios.post(
        "https://api.gemini.com/infringement-check",
        {
          patentId: patent.publication_number,
          companyName: company.name,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.GEMINI_API_KEY}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      throw new Error("Failed to retrieve infringement analysis");
    }
  }
}

module.exports = PatentService;
