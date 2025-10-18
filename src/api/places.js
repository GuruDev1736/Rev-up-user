import { apiGet } from "@/lib/apiClient";

export const getAllPlaces = async () => {
  try {
    // Endpoint: https://api.revupbikes.com/api/places/all
    return await apiGet("/api/places/all");
  } catch (error) {
    console.error("Error in getAllPlaces:", error.message);
    throw error;
  }
};
