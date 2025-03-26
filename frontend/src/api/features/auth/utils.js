/**
 * Gets the access token from storage
 * @returns {string|null} Access token
 */
export const getAccessToken = () => localStorage.getItem('access_token');

/**
 * Gets the refresh token from storage
 * @returns {string|null} Refresh token
 */
export const getRefreshToken = () => localStorage.getItem('refresh_token');

/**
 * Stores authentication tokens
 * @param {string} access - Access token
 * @param {string} refresh - Refresh token
 */
export const storeTokens = (access, refresh) => {
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
};

/**
 * Clears authentication tokens
 */
export const clearTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}; 