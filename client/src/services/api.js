const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const checkPatentInfringement = async (patentId, companyName) => {
  try {
    const response = await fetch(`${API_BASE_URL}/check-infringement`, {
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
    throw new Error(error.message);
  }
};
