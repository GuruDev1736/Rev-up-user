import { apiGetNoAuth } from "@/lib/apiClient";

export const getAllBanners = async () => {
  try {
    return await apiGetNoAuth("/api/banners/all");
  } catch (error) {
    console.error("Error in getAllBanners:", error.message);
    throw error;
  }
};
