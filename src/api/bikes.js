import { apiGet, apiPost } from "@/lib/apiClient";

export const getBikeByPlaceId = async (id) => {
  try {
    return await apiGet(`/api/bikes/place/${id}`);
  } catch (error) {
    console.error("Error in getBikeByPlaceId:", error.message);
    throw error;
  }
};

/**
 * Book a bike
 * @param {Object} bookingData - Booking details
 * @param {number} bookingData.bikeId - ID of the bike to book
 * @param {string} bookingData.startDate - Start date and time (YYYY-MM-DD HH:mm)
 * @param {string} bookingData.endDate - End date and time (YYYY-MM-DD HH:mm)
 * @param {string} bookingData.aadharCardUrl - Uploaded Aadhar card URL
 * @param {string} bookingData.drivingLicenseUrl - Uploaded driving license URL
 * @returns {Promise<Object>} Booking response
 */
export const bookBike = async (bookingData) => {
  try {
    return await apiPost("/api/bookings", bookingData);
  } catch (error) {
    console.error("Error in bookBike:", error.message);
    throw error;
  }
};
