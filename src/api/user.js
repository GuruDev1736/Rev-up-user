import { apiGet, apiPut, apiPost } from "@/lib/apiClient";

export const getUserById = async (userId) => {
  try {
    return await apiGet(`/api/users/${userId}`);
  } catch (error) {
    console.error("Error in getUserById:", error.message);
    throw error;
  }
};

export const updateUser = async (userId, userData) => {
  try {
    return await apiPut(`/api/users/update/${userId}`, userData);
  } catch (error) {
    console.error("Error in updateUser:", error.message);
    throw error;
  }
};

export const uploadProfilePicture = async (fileData) => {
  try {
    return await apiPost("/api/upload", fileData);
  } catch (error) {
    console.error("Error in uploadProfilePicture:", error.message);
    throw error;
  }
};


