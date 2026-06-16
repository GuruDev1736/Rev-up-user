import { apiGet, apiGetBlob, apiPost } from "@/lib/apiClient";

export const getDigilockerAuthUrl = async (userId) => {
	try {
		return await apiGet(`/api/digilocker/auth-url?userId=${userId}`);
	} catch (error) {
		console.error("Error in getDigilockerAuthUrl:", error.message);
		throw error;
	}
};

export const postDigilockerCallback = async (userId, payload) => {
	try {
		// payload should be: { code: "", state: "" }
		return await apiPost(`/api/digilocker/callback?userId=${userId}`, payload);
	} catch (error) {
		console.error("Error in postDigilockerCallback:", error.message);
		return { success: false, message: "DigiLocker callback failed" };
	}
};

export const getDigilockerStatus = async (userId) => {
	try {
		return await apiGet(`/api/digilocker/status?userId=${userId}`);
	} catch (error) {
		console.error("Error in getDigilockerStatus:", error.message);
		return { success: false, message: "Failed to fetch DigiLocker status" };
	}
};

export const getDigilockerDocuments = async (userId) => {
	try {
		return await apiGet(`/api/digilocker/documents/my?userId=${userId}`);
	} catch (error) {
		console.error("Error in getDigilockerDocuments:", error.message);
		return { success: false, message: "Failed to fetch documents" };
	}
}

export const downloadDigilockerDocument = async (documentId) => {
	try {
		return await apiGetBlob(`/api/digilocker/documents/${documentId}`);
	} catch (error) {
		console.error("Error in downloadDigilockerDocument:", error.message);
		console.info(error);
		return { success: false, message: "Failed to download document" };
	}
};