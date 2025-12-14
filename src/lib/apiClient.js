// API Client utility for handling authenticated requests
import { API_CONFIG } from "@/config";

// Get base URL from config
const BASE_URL = API_CONFIG.BASE_URL;

// Get auth token from localStorage
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Create headers with or without auth token
const createHeaders = (includeAuth = true, customHeaders = {}) => {
  const headers = {
    "Content-Type": "application/json",
    ...customHeaders
  };

  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
};

// Generic API call function
export const apiCall = async (endpoint, options = {}) => {
  const {
    method = "GET",
    body = null,
    includeAuth = true,
    customHeaders = {},
    preventRedirect = false,
    ...otherOptions
  } = options;

  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
  
  const config = {
    method,
    headers: createHeaders(includeAuth, customHeaders),
    ...otherOptions
  };

  if (body && (method === "POST" || method === "PUT" || method === "PATCH")) {
    config.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  try {
    const response = await fetch(url, config);
    if (response.status === 401 && includeAuth) {
      if (!preventRedirect && typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Redirect to login page
        window.location.href = '/login';
      }
      throw new Error('Authentication failed. Please login again.');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error.message);
    
    // Check if error message indicates authentication failure
    if (!preventRedirect && error.message && error.message.includes('Authentication failed')) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    
    throw error;
  }
};

// Convenience methods for different HTTP methods

export const apiGet = (endpoint, options = {}) => {
  return apiCall(endpoint, { ...options, method: "GET" });
};

export const apiPost = (endpoint, body, options = {}) => {
  return apiCall(endpoint, { ...options, method: "POST", body });
};

export const apiPut = (endpoint, body, options = {}) => {
  return apiCall(endpoint, { ...options, method: "PUT", body });
};

export const apiPatch = (endpoint, body, options = {}) => {
  return apiCall(endpoint, { ...options, method: "PATCH", body });
};

export const apiDelete = (endpoint, options = {}) => {
  return apiCall(endpoint, { ...options, method: "DELETE" });
};

// Non-authenticated convenience methods (for login/register)
export const apiPostNoAuth = (endpoint, body, options = {}) => {
  return apiCall(endpoint, { ...options, method: "POST", body, includeAuth: false });
};

export const apiGetNoAuth = (endpoint, options = {}) => {
  return apiCall(endpoint, { ...options, method: "GET", includeAuth: false });
};