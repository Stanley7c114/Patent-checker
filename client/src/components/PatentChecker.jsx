import React, { useState } from "react";
import { checkPatentInfringement } from "../services/api";

const PatentChecker = () => {
  const [patentId, setPatentId] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await checkPatentInfringement(patentId, companyName);
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Patent Infringement Checker
          </h1>
          <p className="text-gray-600">
            Analyze potential patent infringements by comparing patent claims
            against company products
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Patent ID
              </label>
              <input
                type="text"
                value={patentId}
                onChange={(e) => setPatentId(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2"
                placeholder="Enter Patent ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2"
                placeholder="Enter Company Name"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-md"
              disabled={loading}
            >
              {loading ? "Checking..." : "Check Infringement"}
            </button>
          </form>
        </div>

        {/* Results */}
        {results && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Infringement Results
            </h2>
            <p className="text-gray-600 mb-4">
              Analysis Date:{" "}
              {new Date(results.analysis_timestamp).toLocaleString()}
            </p>
            {results.top_infringing_products.map((product, index) => (
              <div key={index} className="mb-4">
                <h3 className="text-xl font-semibold text-gray-700">
                  {product.product_name}
                </h3>
                <p className="text-gray-600">
                  Infringement Likelihood: {product.infringement_likelihood}
                </p>
                <p className="text-gray-600">
                  Relevant Claims: {product.relevant_claims.join(", ")}
                </p>
                <p className="text-gray-600">{product.explanation}</p>
                <p className="text-gray-600">
                  Specific Features: {product.specific_features}
                </p>
              </div>
            ))}
            <div className="mt-6 p-6 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-2">
                Overall Risk Assessment
              </h4>
              <p className="text-gray-600">{results.overall_risk_assessment}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-md">{error}</div>
        )}
      </div>
    </div>
  );
};

export default PatentChecker;
