import { apiGet, apiPost } from "@/lib/apiClient";

export const getBikeByPlaceId = async (id) => {
  try {
    return await apiGet(`/api/bikes/place/${id}`);
  } catch (error) {
    console.error("Error in getBikeByPlaceId:", error.message);
    throw error;
  }
};

export const getAllBikes = async () => {
  try {
    return await apiGet("/api/bikes/all");
  } catch (error) {
    console.error("Error in getAllBikes:", error.message);
    throw error;
  }
};

export const bookBike = async (bookingData) => {
  try {
    return await apiPost("/api/bookings", bookingData);
  } catch (error) {
    console.error("Error in bookBike:", error.message);
    throw error;
  }
};
