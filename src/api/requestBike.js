import { apiPost, apiGet } from "@/lib/apiClient";

/**
 * Create a bike request
 * @param {number} userId - User ID
 * @param {number} bikeId - Bike ID
 * @param {string} requestNote - Note for the request
 * @returns {Promise<Object>} Request response
 */
export const createBikeRequest = async (userId, bikeId, requestNote) => {
  try {
    const response = await apiPost(
      `/api/request-bike/create?userId=${userId}&bikeId=${bikeId}`,
      { requestNote }
    );

    if (response && response.STS === "200") {
      return {
        success: true,
        message: response.MSG || "Request submitted successfully",
        data: response.CONTENT
      };
    } else {
      throw new Error(response?.MSG || "Failed to submit request");
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Get all bike requests for a user
 * @param {number} userId - User ID
 * @returns {Promise<Array>} List of user's bike requests
 */
export const getUserBikeRequests = async (userId) => {
  try {
    const response = await apiGet(`/api/request-bike/user/${userId}`);

    if (response && response.STS === "200" && response.CONTENT) {
      return response.CONTENT;
    } else if (Array.isArray(response)) {
      return response;
    } else {
      throw new Error(response?.MSG || "Failed to fetch requests");
    }
  } catch (error) {
    throw error;
  }
};
