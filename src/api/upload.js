import { apiPost } from "@/lib/apiClient";

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result.split(",")[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const uploadDocument = async (file, userId) => {
  try {
    // Convert file to base64
    const base64Data = await fileToBase64(file);

    // Prepare request payload - trim filename to remove any whitespace
    const payload = {
      fileName: file.name.trim(),
      fileData: base64Data,
      userId: userId.toString(),
    };

    // Send to API
    const response = await apiPost("/api/upload", payload);

    if (response.STS === "200" && response.CONTENT) {
      return {
        success: true,
        url: response.CONTENT,
        message: response.MSG,
      };
    } else {
      throw new Error(response.MSG || "Upload failed");
    }
  } catch (error) {
    console.error("Error uploading document:", error);
    throw error;
  }
};