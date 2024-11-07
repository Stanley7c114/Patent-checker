const { GoogleGenerativeAI } = require("@google/generative-ai");

class GeminiService {
  constructor(apiKey) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  async analyzePatentInfringement(patentData, productData) {
    try {
      const analysisTimestamp = new Date().toISOString(); // Capture the current date and time
      console.log("Analysis Timestamp:", analysisTimestamp);
      // Log the structure of patentData
      // console.log("Patent Data:", patentData);

      // Ensure claims is an array
      const claims = Array.isArray(patentData.claims) ? patentData.claims : [];

      // Construct a prompt for the generative model
      const prompt = `Analyze potential patent infringement for the following patent and products:
      Patent: ${patentData.title} (${patentData.publication_number})
      Claims: ${claims.map((claim) => claim.text).join(" ")}
      Products: ${productData.map((product) => product.name).join(", ")}
      For each product, detail which claims are at issue and provide an explanation of why the product potentially infringes the patent.`;

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
        analysis_timestamp: analysisTimestamp, // Include analysis timestamp
      };
    } catch (error) {
      console.error("Error querying Gemini API:", error);
      throw new Error("Failed to query Gemini API");
    }
  }

  parseAnalysis(analysisText, productData) {
    const infringingProducts = [];
    const productSections = analysisText.split(/\*\*\d*\.\s*[A-Za-z\s]+:\*\*/); // Improved split

    console.log("Product Sections:", productSections); // Debugging output

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

    console.log("Infringing Products:", infringingProducts); // Final output for debugging
    return infringingProducts.slice(0, 2);
  }

  extractProductSection(analysisText, productName) {
    // Extract the section of the analysis text related to the specific product
    const productPattern = new RegExp(
      `Product: ${productName}.*?(?=Product:|$)`,
      "s"
    );
    const match = productPattern.exec(analysisText);
    return match ? match[0] : null;
  }

  extractClaims(analysisText, productName) {
    // Extract relevant claims from the analysis text
    const claims = [];
    const claimPattern = /Claim \d+/g;
    let match;
    while ((match = claimPattern.exec(analysisText)) !== null) {
      claims.push(match[0]);
    }
    return claims;
  }

  extractExplanation(analysisText, productName) {
    // Extract the explanation from the analysis text
    const explanationPattern = /Explanation: (.*?)(?=Specific Features:|$)/s;
    const match = explanationPattern.exec(analysisText);
    return match ? match[1].trim() : "No explanation provided.";
  }

  extractSpecificFeatures(analysisText, productName) {
    // Extract specific features from the analysis text
    const featuresPattern = /Specific Features: (.*?)(?=Product:|$)/s;
    const match = featuresPattern.exec(analysisText);
    return match ? match[1].trim() : "No specific features provided.";
  }

  assessRisk(infringingProducts) {
    // Assess overall risk based on infringing products
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

module.exports = GeminiService;
