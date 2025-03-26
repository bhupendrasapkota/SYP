import api from '../../config';

export const authApi = {
  /**
   * Register user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Success message
   */
  register: (userData) => api.post('/auth/register/', userData),
  
  /**
   * Login user
   * @param {Object} credentials - Login credentials (email and password)
   * @returns {Promise<Object>} Access and refresh tokens
   */
  login: (credentials) => api.post('/auth/login/', credentials),
  
  /**
   * Logout user
   * @param {string} refreshToken - Refresh token to blacklist
   * @returns {Promise<Object>} Success message
   */
  logout: (refreshToken) => api.post('/auth/logout/', { refresh: refreshToken })
}; 