import { apiPost } from "@/lib/apiClient";

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
