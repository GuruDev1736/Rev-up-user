import { apiPost } from "@/lib/apiClient";

/**
 * Create a Razorpay order
 * @param {Object} params - Order parameters
 * @param {number} params.bikeId - Bike ID
 * @param {number} params.userId - User ID
 * @param {string} params.amount - Amount in INR (e.g., "399")
 * @param {string} params.receipt - Receipt identifier (default: "None")
 * @returns {Promise<Object>} Razorpay order response with order ID
 */
export const createRazorpayOrder = async ({ bikeId, userId, amount, receipt = "None" }) => {
  try {
    const response = await apiPost(
      `/api/razorpay/orders/create?bikeId=${bikeId}&userId=${userId}`,
      {
        amount: amount.toString(),
        receipt: receipt
      }
    );

    if (response && response.STS === "200" && response.CONTENT) {
      return {
        success: true,
        orderId: response.CONTENT.id,
        amount: response.CONTENT.amount,
        currency: response.CONTENT.currency,
        orderData: response.CONTENT,
        message: response.MSG || "Order created successfully"
      };
    } else {
      throw new Error(response?.MSG || "Failed to create Razorpay order");
    }
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    throw error;
  }
};
