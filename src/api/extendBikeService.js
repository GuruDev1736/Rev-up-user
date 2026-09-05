import { apiPost } from "@/lib/apiClient";
import { getToken } from "@/lib/storage";

/**
 * Record a bike extension service entry.
 */
export const extendBikeService = async ({
  bookingId,
  currentDateTime,
  newDateTime,
  extendDuration,
  pricePerDuration,
  totalPrice,
  extensionType,
}) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("Your session has expired. Please log in again before extending the booking.");
    }

    const response = await apiPost(`/api/extend-bike-service/extend?bookingId=${bookingId}`, {
      currentDateTime,
      newDateTime,
      extendDuration,
      pricePerDuration,
      totalPrice,
      extensionType,
    }, {
      customHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response?.STS === "200" && response?.CONTENT) {
      return {
        success: true,
        content: response.CONTENT,
        message: response.MSG || "Bike Extended Successfully",
      };
    }

    throw new Error(response?.MSG || "Failed to extend bike service");
  } catch (error) {
    console.error("Error extending bike service:", error);
    throw error;
  }
};