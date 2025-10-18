/**
 * Load Razorpay script dynamically
 * @returns {Promise<boolean>}
 */
import { RAZORPAY_CONFIG, APP_CONFIG } from "@/config";

export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    // Check if script already loaded
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

/**
 * Open Razorpay payment modal
 * @param {Object} options - Payment options
 * @param {number} options.amount - Amount in paise (multiply by 100)
 * @param {string} options.currency - Currency code (default: INR)
 * @param {string} options.name - Business name
 * @param {string} options.description - Payment description
 * @param {string} options.orderId - Order ID from backend (optional)
 * @param {Object} options.prefill - User prefill data
 * @param {Function} options.onSuccess - Success callback with payment response
 * @param {Function} options.onFailure - Failure callback
 * @returns {Promise<void>}
 */
export const initiateRazorpayPayment = async ({
  amount,
  currency = "INR",
  name = APP_CONFIG.NAME,
  description,
  orderId,
  prefill = {},
  onSuccess,
  onFailure,
}) => {
  // Load Razorpay script
  const isLoaded = await loadRazorpayScript();

  if (!isLoaded) {
    alert("Failed to load Razorpay SDK. Please check your internet connection.");
    onFailure?.(new Error("Razorpay SDK failed to load"));
    return;
  }

  // Get Razorpay key from config
  const razorpayKey = RAZORPAY_CONFIG.KEY_ID;

  if (!razorpayKey) {
    console.error("Razorpay key not found in environment variables");
    alert("Payment configuration error. Please contact support.");
    onFailure?.(new Error("Razorpay key not configured"));
    return;
  }

  const options = {
    key: razorpayKey,
    amount: Math.round(amount * 100), // Amount in paise
    currency: currency,
    name: name,
    description: description,
    order_id: orderId, // Optional: Get from backend if using orders API
    image: "/logo.png", // Your logo
    handler: function (response) {
      // Payment success handler
      console.log("Payment successful:", response);
      onSuccess?.(response);
    },
    prefill: {
      name: prefill.name || "",
      email: prefill.email || "",
      contact: prefill.contact || "",
    },
    notes: {
      description: description,
    },
    theme: {
      color: APP_CONFIG.THEME_COLOR,
    },
    modal: {
      ondismiss: function () {
        console.log("Payment modal closed");
        onFailure?.(new Error("Payment cancelled by user"));
      },
    },
  };

  const razorpay = new window.Razorpay(options);
  razorpay.open();
};
