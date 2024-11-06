const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

/**
 * Sends a request to check for patent infringement.
 * @param {string} patentId - The ID of the patent to check.
 * @param {string} companyName - The name of the company to check against.
 * @returns {Promise<Object>} - The response data from the server.
 * @throws {Error} - If the request fails or the server returns an error.
 */
export const checkPatentInfringement = async (patentId, companyName) => {
  try {
    const response = await fetch(`${API_BASE_URL}/infringement-check`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ patentId, companyName }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to check patent infringement");
    }

    return await response.json();
  } catch (error) {
    console.error("Error in checkPatentInfringement:", error);
    throw new Error(error.message);
  }
};
