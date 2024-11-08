import fetch from "node-fetch";
import { GoogleGenerativeAI } from "@google/generative-ai";

class GeminiService {
  constructor(apiKey) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  async analyzePatentInfringement(patentData, productData) {
    try {
      const analysisTimestamp = new Date().toISOString();

      const claims = Array.isArray(patentData.claims) ? patentData.claims : [];

      const prompt = `Analyze potential patent infringement for the following patent and products:
      Patent: ${patentData.title} (${patentData.publication_number})
      Claims: ${claims.map((claim) => claim.text).join(" ")}
      Products: ${productData.map((product) => product.name).join(", ")}
      For each product, detail which claims are at issue and provide an explanation of why the product potentially infringes the patent.`;

      const result = await this.model.generateContent(prompt);

      const analysisText = result.response.text();

      const topInfringingProducts = this.parseAnalysis(
        analysisText,
        productData
      );

      return {
        analysis: analysisText,
        top_infringing_products: topInfringingProducts,
        overall_risk_assessment: this.assessRisk(topInfringingProducts),
        analysis_timestamp: analysisTimestamp,
      };
    } catch (error) {
      console.error("Error querying Gemini API:", error);
      throw new Error("Failed to query Gemini API");
    }
  }

  parseAnalysis(analysisText, productData) {
    const infringingProducts = [];
    const productSections = analysisText.split(/\*\*\d*\.\s*[A-Za-z\s]+:\*\*/);

    productData.forEach((product) => {
      productSections.forEach((section) => {
        const productNamePattern = new RegExp(
          `\\*\\*\\d*\\.\\s*${product.name}:\\*\\*`,
          "i"
        );

        if (productNamePattern.test(section)) {
          const claimsMatch = section.match(
            /Claims at issue:\s*(.*?)(?=\n|$)/i
          );
          const explanationMatch = section.match(
            /Explanation:\s*(.*?)(?=\*\*|$)/is
          );

          console.log(
            "Claims Match:",
            claimsMatch ? claimsMatch[1] : "No claims found"
          );
          console.log(
            "Explanation Match:",
            explanationMatch ? explanationMatch[1] : "No explanation found"
          );

          if (claimsMatch || explanationMatch) {
            infringingProducts.push({
              product_name: product.name,
              infringement_likelihood: "High",
              relevant_claims: claimsMatch ? claimsMatch[1].split(", ") : [],
              explanation: explanationMatch
                ? explanationMatch[1].trim()
                : "No explanation provided.",
              specific_features:
                "Specific features related to the infringement",
            });
          }
        }
      });
    });

    // console.log("Infringing Products:", infringingProducts);
    return infringingProducts.slice(0, 2);
  }

  extractProductSection(analysisText, productName) {
    const productPattern = new RegExp(
      `Product: ${productName}.*?(?=Product:|$)`,
      "s"
    );
    const match = productPattern.exec(analysisText);
    return match ? match[0] : null;
  }

  extractClaims(analysisText, productName) {
    const claims = [];
    const claimPattern = /Claim \d+/g;
    let match;
    while ((match = claimPattern.exec(analysisText)) !== null) {
      claims.push(match[0]);
    }
    return claims;
  }

  extractExplanation(analysisText, productName) {
    const explanationPattern = /Explanation: (.*?)(?=Specific Features:|$)/s;
    const match = explanationPattern.exec(analysisText);
    return match ? match[1].trim() : "No explanation provided.";
  }

  extractSpecificFeatures(analysisText, productName) {
    const featuresPattern = /Specific Features: (.*?)(?=Product:|$)/s;
    const match = featuresPattern.exec(analysisText);
    return match ? match[1].trim() : "No specific features provided.";
  }

  assessRisk(infringingProducts) {
    if (infringingProducts.length > 4) {
      return "High";
    } else if (
      infringingProducts.length > 0 &&
      infringingProducts.length <= 3
    ) {
      return "Moderate";
    } else {
      return "Low";
    }
  }
}

export default GeminiService;
