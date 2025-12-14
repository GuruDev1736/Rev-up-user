import { apiPost, apiGet, apiPut } from "@/lib/apiClient";

/**
 * Check if user has an active booking
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Active booking check result
 */
export const checkActiveBooking = async (userId) => {
  try {
    const response = await apiGet(`/api/bookings/check/${userId}`, { preventRedirect: true });

    if (response && response.STS === "200") {
      return {
        hasActiveBooking: response.CONTENT === true,
        message: response.MSG || ""
      };
    } else {
      return {
        hasActiveBooking: false,
        message: ""
      };
    }
  } catch (error) {
    // If API fails, allow booking to proceed
    return {
      hasActiveBooking: false,
      message: ""
    };
  }
};

/**
 * Get all bookings for a user
 * @param {number} userId - User ID
 * @returns {Promise<Array>} List of user bookings
 */
export const getUserBookings = async (userId) => {
  try {
    const response = await apiGet(`/api/bookings/user/${userId}`);

    if (response && response.STS === "200" && response.CONTENT) {
      return response.CONTENT;
    } else if (Array.isArray(response)) {
      return response;
    } else {
      throw new Error(response?.MSG || "Failed to fetch bookings");
    }
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    throw error;
  }
};

/**
 * Create a booking after successful payment
 * @param {Object} bookingData - Booking details
 * @param {number} bookingData.userId - User ID
 * @param {number} bookingData.bikeId - Bike ID
 * @param {string} bookingData.startDateTime - Start date time (YYYY-MM-DD HH:mm)
 * @param {string} bookingData.endDateTime - End date time (YYYY-MM-DD HH:mm)
 * @param {string} bookingData.paymentId - Razorpay payment ID
 * @param {number} bookingData.totalAmount - Total amount paid
 * @param {string} bookingData.aadharcardUrl - Aadhar card URL
 * @param {string} bookingData.drivingLicenseUrl - Driving license URL
 * @returns {Promise<Object>} Booking response with invoice
 */
export const createBooking = async (bookingData) => {
  try {
    const { userId, bikeId, ...payload } = bookingData;
    
    const response = await apiPost(
      `/api/bookings/create?userId=${userId}&bikeId=${bikeId}`,
      payload
    );

    if (response.STS === "200" && response.CONTENT) {
      return {
        success: true,
        booking: response.CONTENT,
        message: response.MSG,
      };
    } else {
      throw new Error(response.MSG || "Booking creation failed");
    }
  } catch (error) {
    console.error("Error creating booking:", error);
    throw error;
  }
};

/**
 * Cancel a booking
 * @param {number} bookingId - Booking ID
 * @param {string} reason - Cancellation reason
 * @returns {Promise<Object>} Cancellation response
 */
export const cancelBooking = async (bookingId, reason) => {
  try {
    const response = await apiPut(
      `/api/bookings/${bookingId}/cancel`,
      { reason }
    );

    if (response && response.STS === "200") {
      return {
        success: true,
        message: response.MSG || "Booking cancelled successfully",
      };
    } else {
      throw new Error(response?.MSG || "Failed to cancel booking");
    }
  } catch (error) {
    console.error("Error cancelling booking:", error);
    throw error;
  }
};

/**
 * Download invoice from URL
 * @param {string} invoiceUrl - Invoice PDF URL
 * @param {string} bookingId - Booking ID for filename
 */
export const downloadInvoice = (invoiceUrl, bookingId) => {
  const link = document.createElement("a");
  link.href = invoiceUrl;
  link.download = `Invoice_${bookingId}.pdf`;
  link.target = "_blank";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Extend booking end date
 * @param {number} bookingId - Booking ID
 * @param {string} endDate - New end date in format "YYYY-MM-DD HH:mm"
 * @returns {Promise<Object>} Updated booking response
 */
export const extendBookingEndDate = async (bookingId, endDate) => {
  try {
    const response = await apiPut(
      `/api/bookings/end-date/${bookingId}?endDate=${encodeURIComponent(endDate)}`
    );

    if (response.STS === "200" && response.CONTENT) {
      return {
        success: true,
        booking: response.CONTENT,
        message: response.MSG || "Booking extended successfully",
      };
    } else {
      throw new Error(response?.MSG || "Failed to extend booking");
    }
  } catch (error) {
    console.error("Error extending booking:", error);
    throw error;
  }
};
