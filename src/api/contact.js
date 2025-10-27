import { apiPostNoAuth } from "@/lib/apiClient";

export const sendContactMessage = async ({ subject, message }) => {
  try {
    return await apiPostNoAuth("/api/contact/send", {
      subject,
      message
    });
  } catch (error) {
    console.error("Error in sendContactMessage:", error.message);
    throw error;
  }
};
