/**
 * Centralized configuration for environment variables
 * All environment variables should be accessed through this file
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.revupbikes.com",
};

// Razorpay Configuration
export const RAZORPAY_CONFIG = {
  KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
};

// App Configuration
export const APP_CONFIG = {
  NAME: "RevUp Bikes",
  THEME_COLOR: "#DC2626", // Red color
};

// Validation helpers
export const validateConfig = () => {
  const errors = [];

  if (!RAZORPAY_CONFIG.KEY_ID) {
    errors.push("NEXT_PUBLIC_RAZORPAY_KEY_ID is not configured");
  }

  if (!API_CONFIG.BASE_URL) {
    errors.push("NEXT_PUBLIC_API_BASE_URL is not configured");
  }

  if (errors.length > 0) {
    console.error("Configuration errors:", errors);
    return false;
  }

  return true;
};

// Log configuration on startup (only in development)
if (process.env.NODE_ENV === "development") {
  console.log("🔧 Configuration loaded:", {
    API_BASE_URL: API_CONFIG.BASE_URL,
    RAZORPAY_KEY_ID: RAZORPAY_CONFIG.KEY_ID ? `${RAZORPAY_CONFIG.KEY_ID.substring(0, 10)}...` : "NOT SET",
  });
}
