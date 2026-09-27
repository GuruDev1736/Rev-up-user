/**
 * Razorpay Payment Integration
 * Supports both Native Android/iOS checkout via Capacitor Razorpay SDK
 * and Web Checkout fallback for standard web browsers.
 */
import { Capacitor } from "@capacitor/core";
import { RAZORPAY_CONFIG, APP_CONFIG } from "@/config";

/**
 * Load Razorpay web checkout script dynamically (for browser/web fallback)
 * @returns {Promise<boolean>}
 */
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

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
 * Detects native Capacitor environment (Android/iOS) and uses the native Razorpay SDK.
 * Falls back to Razorpay Web Checkout when running in a standard web browser.
 * 
 * @param {Object} options - Payment options
 * @param {number} options.amount - Amount in INR (will be converted to paise)
 * @param {string} options.currency - Currency code (default: INR)
 * @param {string} options.name - Business name
 * @param {string} options.description - Payment description
 * @param {string} options.orderId - Order ID from backend (optional but recommended)
 * @param {Object} options.prefill - User prefill data (name, email, contact)
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
  if (typeof window === "undefined") {
    return;
  }

  // Validate Razorpay Key
  const razorpayKey = RAZORPAY_CONFIG.KEY_ID;

  if (!razorpayKey) {
    console.error("Razorpay key not found in environment variables");
    alert("Payment configuration error. Please contact support.");
    onFailure?.(new Error("Razorpay key not configured"));
    return;
  }

  const amountInPaise = Math.round(Number(amount) * 100);

  // Check if running inside native Capacitor app (Android or iOS)
  const isNative = Capacitor.isNativePlatform();

  if (isNative) {
    try {
      console.log("Launching Native Razorpay SDK via Capacitor...");

      const { Checkout } = await import("capacitor-razorpay");

      const logoUrl =
        typeof window !== "undefined" && window.location?.origin
          ? `${window.location.origin}/logo.png`
          : "https://beta.revupbikes.com/logo.png";

      const nativeOptions = {
        key: razorpayKey,
        amount: amountInPaise.toString(),
        currency: currency,
        name: name,
        description: description || "Payment",
        image: logoUrl,
        prefill: {
          name: prefill.name || "",
          email: prefill.email || "",
          contact: prefill.contact || "",
        },
        theme: {
          color: APP_CONFIG.THEME_COLOR || "#DC2626",
        },
        notes: {
          description: description || "",
        },
      };

      if (orderId) {
        nativeOptions.order_id = orderId;
      }

      const result = await Checkout.open(nativeOptions);
      console.log("Native Razorpay payment completed:", result);

      let responseData = result?.response || result;
      if (typeof responseData === "string") {
        try {
          responseData = JSON.parse(responseData);
        } catch (_) {
          responseData = { razorpay_payment_id: responseData };
        }
      }

      const paymentId =
        responseData?.razorpay_payment_id ||
        responseData?.payment_id ||
        responseData?.paymentId ||
        (typeof responseData === "string" ? responseData : null);

      const normalizedResponse = {
        razorpay_payment_id: paymentId,
        razorpay_order_id: responseData?.razorpay_order_id || orderId,
        razorpay_signature: responseData?.razorpay_signature || "",
        ...responseData,
      };

      onSuccess?.(normalizedResponse);
      return;
    } catch (error) {
      console.error("Native Razorpay checkout failed or cancelled:", error);
      let errMsg = "Payment cancelled or failed";
      if (error?.message) {
        errMsg = error.message;
        try {
          const parsed = JSON.parse(error.message);
          if (parsed?.description) errMsg = parsed.description;
        } catch (_) {}
      }
      onFailure?.(new Error(errMsg));
      return;
    }
  }

  // Web Browser Fallback: Load checkout.js
  const isLoaded = await loadRazorpayScript();

  if (!isLoaded) {
    alert("Failed to load Razorpay SDK. Please check your internet connection.");
    onFailure?.(new Error("Razorpay SDK failed to load"));
    return;
  }

  const webOptions = {
    key: razorpayKey,
    amount: amountInPaise,
    currency: currency,
    name: name,
    description: description,
    image: "/logo.png",
    handler: function (response) {
      console.log("Web Razorpay payment successful:", response);
      onSuccess?.(response);
    },
    prefill: {
      name: prefill.name || "",
      email: prefill.email || "",
      contact: prefill.contact || "",
    },
    notes: {
      description: description || "",
    },
    theme: {
      color: APP_CONFIG.THEME_COLOR,
    },
    modal: {
      ondismiss: function () {
        console.log("Payment modal closed by user");
        onFailure?.(new Error("Payment cancelled by user"));
      },
    },
    config: {
      display: {
        blocks: {
          banks: {
            name: "All payment methods",
            instruments: [
              { method: "upi" },
              { method: "card" },
              { method: "netbanking" },
              { method: "wallet" },
            ],
          },
        },
        sequence: ["block.banks"],
        preferences: {
          show_default_blocks: true,
        },
      },
    },
    method: {
      upi: true,
      card: true,
      netbanking: true,
      wallet: true,
    },
  };

  if (orderId) {
    webOptions.order_id = orderId;
  }

  const razorpay = new window.Razorpay(webOptions);
  razorpay.open();
};
