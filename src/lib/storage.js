// Storage utility for managing authentication data

const STORAGE_KEYS = {
  TOKEN: 'token',
  USER_DATA: 'userData',
};

/**
 * Store authentication token
 */
export const setToken = (token) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  }
};

/**
 * Get authentication token
 */
export const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  }
  return null;
};

/**
 * Remove authentication token
 */
export const removeToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
  }
};

/**
 * Store user data
 */
export const setUserData = (userData) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
  }
};

/**
 * Get user data
 */
export const getUserData = () => {
  if (typeof window !== 'undefined') {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }
  return null;
};

/**
 * Remove user data
 */
export const removeUserData = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
  }
};

/**
 * Clear all authentication data
 */
export const clearAuthData = () => {
  removeToken();
  removeUserData();
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return !!getToken();
};

/**
 * Get current user info
 */
export const getCurrentUser = () => {
  return {
    token: getToken(),
    userData: getUserData(),
    isAuthenticated: isAuthenticated(),
  };
};
