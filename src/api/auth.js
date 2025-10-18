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
