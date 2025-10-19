import { apiPostNoAuth } from "@/lib/apiClient";

export const loginUser = async ({ email, password }) => {
  try {
    return await apiPostNoAuth("/api/auth/login", {
      email,
      password,
    });
  } catch (error) {
    console.error("Error in loginUser:", error.message);
    throw error;
  }
};

export const registerUser = async ({
  firstName,
  lastName,
  phoneNumber,
  email,
  password,
  profilePicture,
}) => {
  try {
    return await apiPostNoAuth("/api/auth/user/register", {
      firstName,
      lastName,
      phoneNumber,
      email,
      password,
      profilePicture,
    });
  } catch (error) {
    console.error("Error in registerUser:", error.message);
    throw error;
  }
};

// Forgot Password - Send OTP
export const sendForgotPasswordOTP = async (email) => {
  try {
    return await apiPostNoAuth(`/api/forgot-password/send-otp?email=${email}`);
  } catch (error) {
    console.error("Error in sendForgotPasswordOTP:", error.message);
    throw error;
  }
};

// Forgot Password - Verify OTP
export const verifyForgotPasswordOTP = async (email, otp) => {
  try {
    return await apiPostNoAuth(`/api/forgot-password/verify-otp?email=${email}&otp=${otp}`);
  } catch (error) {
    console.error("Error in verifyForgotPasswordOTP:", error.message);
    throw error;
  }
};

// Forgot Password - Reset Password
export const resetPassword = async (email , newPassword) => {
  try {
    return await apiPostNoAuth(`/api/forgot-password/reset-password?email=${email}&newPassword=${newPassword}`);
  } catch (error) {
    console.error("Error in resetPassword:", error.message);
    throw error;
  }
};
