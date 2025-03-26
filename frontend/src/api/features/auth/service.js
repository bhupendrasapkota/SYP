import { authApi } from './index';
import { retryRequest } from '../base/retry';

/**
 * Custom error class for API errors
 */
class AuthApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'AuthApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Token management utilities
 */
const tokenManager = {
  setTokens: (access, refresh) => {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
  },
  
  getAccessToken: () => localStorage.getItem('access_token'),
  getRefreshToken: () => localStorage.getItem('refresh_token'),
  
  clearTokens: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
  
  hasTokens: () => {
    return !!localStorage.getItem('access_token') && !!localStorage.getItem('refresh_token');
  }
};

/**
 * Service layer for authentication-related API operations
 * Handles error handling, retries, and data transformation
 */
export const authService = {
  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Success message
   */
  register: async (userData) => {
    try {
      const response = await retryRequest(() => authApi.register(userData));
      return response.data;
    } catch (error) {
      throw new AuthApiError(
        'Failed to register',
        error.response?.status,
        error.response?.data
      );
    }
  },

  /**
   * Login user
   * @param {Object} credentials - Login credentials (email and password)
   * @returns {Promise<Object>} Access and refresh tokens
   */
  login: async (credentials) => {
    try {
      const response = await retryRequest(() => authApi.login(credentials));
      return response.data;
    } catch (error) {
      throw new AuthApiError(
        'Failed to login',
        error.response?.status,
        error.response?.data
      );
    }
  },

  /**
   * Logout user
   * @param {string} refreshToken - Refresh token to blacklist
   * @returns {Promise<Object>} Success message
   */
  logout: async (refreshToken) => {
    try {
      const response = await retryRequest(() => authApi.logout(refreshToken));
      return response.data;
    } catch (error) {
      throw new AuthApiError(
        'Failed to logout',
        error.response?.status,
        error.response?.data
      );
    }
  },

  /**
   * Refresh access token
   * @returns {Promise<Object>} New access token
   */
  refreshToken: async () => {
    try {
      const refreshToken = tokenManager.getRefreshToken();
      if (!refreshToken) throw new Error('No refresh token available');
      
      const response = await retryRequest(() => authApi.refreshToken(refreshToken));
      // Update access token
      localStorage.setItem('access_token', response.data.access);
      return response.data;
    } catch (error) {
      // Clear tokens on refresh failure
      tokenManager.clearTokens();
      throw new AuthApiError(
        'Failed to refresh token',
        error.response?.status,
        error.response?.data
      );
    }
  },

  /**
   * Verify email
   * @param {string} token - Email verification token
   * @returns {Promise<void>}
   */
  verifyEmail: async (token) => {
    try {
      await retryRequest(() => authApi.verifyEmail(token));
    } catch (error) {
      throw new AuthApiError(
        'Failed to verify email',
        error.response?.status,
        error.response?.data
      );
    }
  },

  /**
   * Resend verification email
   * @param {string} email - User's email
   * @returns {Promise<void>}
   */
  resendVerificationEmail: async (email) => {
    try {
      await retryRequest(() => authApi.resendVerificationEmail(email));
    } catch (error) {
      throw new AuthApiError(
        'Failed to resend verification email',
        error.response?.status,
        error.response?.data
      );
    }
  },

  /**
   * Request password reset
   * @param {string} email - User's email
   * @returns {Promise<void>}
   */
  requestPasswordReset: async (email) => {
    try {
      await retryRequest(() => authApi.requestPasswordReset(email));
    } catch (error) {
      throw new AuthApiError(
        'Failed to request password reset',
        error.response?.status,
        error.response?.data
      );
    }
  },

  /**
   * Reset password
   * @param {string} token - Password reset token
   * @param {string} newPassword - New password
   * @returns {Promise<void>}
   */
  resetPassword: async (token, newPassword) => {
    try {
      await retryRequest(() => authApi.resetPassword(token, newPassword));
    } catch (error) {
      throw new AuthApiError(
        'Failed to reset password',
        error.response?.status,
        error.response?.data
      );
    }
  },

  /**
   * Get current user
   * @returns {Promise<Object>} Current user data
   */
  getCurrentUser: async () => {
    try {
      const response = await retryRequest(() => authApi.getCurrentUser());
      return response.data;
    } catch (error) {
      throw new AuthApiError(
        'Failed to get current user',
        error.response?.status,
        error.response?.data
      );
    }
  },

  /**
   * Update current user
   * @param {Object} data - Updated user data
   * @returns {Promise<Object>} Updated user data
   */
  updateCurrentUser: async (data) => {
    try {
      const response = await retryRequest(() => authApi.updateCurrentUser(data));
      return response.data;
    } catch (error) {
      throw new AuthApiError(
        'Failed to update current user',
        error.response?.status,
        error.response?.data
      );
    }
  },

  /**
   * Check if user is authenticated
   * @returns {Promise<boolean>} Authentication status
   */
  isAuthenticated: async () => {
    try {
      if (!tokenManager.hasTokens()) return false;
      const response = await retryRequest(() => authApi.isAuthenticated());
      return response.data.isAuthenticated;
    } catch (error) {
      return false;
    }
  },

  /**
   * Get current access token
   * @returns {string|null} Current access token
   */
  getAccessToken: () => tokenManager.getAccessToken(),

  /**
   * Get current refresh token
   * @returns {string|null} Current refresh token
   */
  getRefreshToken: () => tokenManager.getRefreshToken()
}; 