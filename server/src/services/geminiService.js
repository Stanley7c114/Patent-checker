const { GoogleGenerativeAI } = require("@google/generative-ai");

class GeminiService {
  constructor(apiKey) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  async analyzePatentInfringement(patentData, productData) {
    try {
      // Log the structure of patentData
      console.log("Patent Data:", patentData);

      // Ensure claims is an array
      const claims = Array.isArray(patentData.claims) ? patentData.claims : [];

      // Construct a prompt for the generative model
      const prompt = `Analyze potential patent infringement for the following patent and products:
      Patent: ${patentData.title} (${patentData.publication_number})
      Claims: ${claims.map((claim) => claim.text).join(" ")}
      Products: ${productData.map((product) => product.name).join(", ")}`;

      // Use the generative model to generate content
      const result = await this.model.generateContent(prompt);

      // Extract the analysis text from the response
      const analysisText = result.response.text();

      // Parse the analysis text to determine top infringing products
      const topInfringingProducts = this.parseAnalysis(
        analysisText,
        productData
      );

      return {
        analysis: analysisText,
        top_infringing_products: topInfringingProducts,
        overall_risk_assessment: this.assessRisk(topInfringingProducts),
      };
    } catch (error) {
      console.error("Error querying Gemini API:", error);
      throw new Error("Failed to query Gemini API");
    }
  }

  parseAnalysis(analysisText, productData) {
    // Example logic to parse the analysis text and determine infringing products
    const infringingProducts = [];

    productData.forEach((product) => {
      if (analysisText.includes(product.name)) {
        infringingProducts.push({
          product_name: product.name,
          infringement_likelihood: "High", // Example based on analysis
          relevant_claims: this.extractClaims(analysisText, product.name),
          explanation: `The product ${product.name} potentially infringes due to similarities in functionality described in the patent claims.`,
        });
      }
    });

    // Return the top two infringing products
    return infringingProducts.slice(0, 2);
  }

  extractClaims(analysisText, productName) {
    // Example logic to extract relevant claims from the analysis text
    const claims = [];
    const claimPattern = /Claim \d+/g;
    let match;
    while ((match = claimPattern.exec(analysisText)) !== null) {
      claims.push(match[0]);
    }
    return claims;
  }

  assessRisk(infringingProducts) {
    // Example logic to assess overall risk based on infringing products
    if (infringingProducts.length > 0) {
      return "High";
    }
    return "Low";
  }
}

module.exports = GeminiService;
