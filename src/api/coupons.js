import { apiGet, apiPut } from "@/lib/apiClient";

/**
 * Get coupon details by coupon code
 * @param {string} couponCode - The coupon code to validate
 * @returns {Promise<Object>} Coupon details
 */
export const applyCoupon = async (couponCode) => {
  try {
    const response = await apiGet(`/api/coupons/${couponCode}`);

    if (response && response.STS === "200" && response.CONTENT) {
      const coupon = response.CONTENT;
      
      // Check if coupon is active
      if (!coupon.isActive) {
        throw new Error("This coupon is no longer active");
      }

      // Check expiry date
      if (coupon.couponExpiryDate && coupon.couponExpiryDate.length === 3) {
        const [year, month, day] = coupon.couponExpiryDate;
        const expiryDate = new Date(year, month - 1, day); // month is 0-indexed in JS
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (expiryDate < today) {
          throw new Error("This coupon has expired");
        }
      }

      return {
        success: true,
        coupon: {
          code: coupon.couponCode,
          name: coupon.couponName,
          description: coupon.couponDescription,
          discount: coupon.couponDiscount, // This is the percentage discount
          expiryDate: coupon.couponExpiryDate,
          type: coupon.couponType,
        },
        message: response.MSG || "Coupon applied successfully",
      };
    } else {
      throw new Error(response?.MSG || "Invalid coupon code");
    }
  } catch (error) {
    // Re-throw the error without logging to avoid console errors
    throw error;
  }
};

/**
 * Submit coupon usage after successful payment
 * @param {string} couponCode - The coupon code to apply
 * @returns {Promise<Object>} Response from the server
 */
export const submitCouponUsage = async (couponCode) => {
  try {
    const response = await apiPut(`/api/coupons/apply/${couponCode}`);
    return {
      success: response?.STS === "200",
      message: response?.MSG || "Coupon usage recorded",
    };
  } catch (error) {
    // Re-throw the error for handling in the calling function
    throw error;
  }
};
