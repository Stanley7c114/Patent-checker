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
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., US-RE49889-E1"
                required
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
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Walmart Inc."
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition duration-150 ease-in-out disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Analyzing...
                </span>
              ) : (
                "Check Infringement"
              )}
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {results && !loading && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Analysis Results
            </h2>

            <div className="space-y-6">
              {results.top_infringing_products.map((product, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">
                      {product.product_name}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        product.infringement_likelihood === "High"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {product.infringement_likelihood} Risk
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">
                        Relevant Claims
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {product.relevant_claims.map((claim, i) => (
                          <span
                            key={i}
                            className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-sm"
                          >
                            Claim {claim}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">
                        Explanation
                      </h4>
                      <p className="text-gray-600">{product.explanation}</p>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">
                        Specific Features
                      </h4>
                      <ul className="list-disc list-inside space-y-1">
                        {product.specific_features.map((feature, i) => (
                          <li key={i} className="text-gray-600">
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}

              <div className="mt-6 p-6 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2">
                  Overall Risk Assessment
                </h4>
                <p className="text-gray-600">
                  {results.overall_risk_assessment}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatentChecker;
