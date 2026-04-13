import { apiPost } from "@/lib/apiClient";

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
    const response = await apiPost(`/api/extend-bike-service/extend?bookingId=${bookingId}`, {
      currentDateTime,
      newDateTime,
      extendDuration,
      pricePerDuration,
      totalPrice,
      extensionType,
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