import { usersApi } from './index';
import { retryRequest } from '../base/retry';

/**
 * Custom error class for API errors
 */
class UserApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'UserApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Service layer for users-related API operations
 * Handles error handling, retries, and data transformation
 */
export const usersService = {
  /**
   * Get user profile
   * @param {string} username - Username to get profile for
   * @returns {Promise<Object>} User profile data
   */
  getUserProfile: async (username) => {
    try {
      const response = await retryRequest(() => usersApi.getUserProfile(username));
      return response.data;
    } catch (error) {
      throw new UserApiError(
        'Failed to fetch user profile',
        error.response?.status,
        error.response?.data
      );
    }
  },

  /**
   * Update user profile
   * @param {Object} data - Updated profile data
   * @returns {Promise<Object>} Updated profile data
   */
  updateProfile: async (data) => {
    try {
      const response = await retryRequest(() => usersApi.updateProfile(data));
      return response.data;
    } catch (error) {
      throw new UserApiError(
        'Failed to update profile',
        error.response?.status,
        error.response?.data
      );
    }
  },

  /**
   * Change password
   * @param {Object} data - Password change data
   * @returns {Promise<void>}
   */
  changePassword: async (data) => {
    try {
      await retryRequest(() => usersApi.changePassword(data));
    } catch (error) {
      throw new UserApiError(
        'Failed to change password',
        error.response?.status,
        error.response?.data
      );
    }
  },

  /**
   * Get user statistics
   * @param {string} username - Username to get stats for
   * @returns {Promise<Object>} User statistics
   */
  getUserStats: async (username) => {
    try {
      const response = await retryRequest(() => usersApi.getUserStats(username));
      return response.data;
    } catch (error) {
      throw new UserApiError(
        'Failed to fetch user statistics',
        error.response?.status,
        error.response?.data
      );
    }
  },

  /**
   * Get user's followers
   * @param {string} username - Username to get followers for
   * @param {Object} params - Query parameters (page, page_size, etc.)
   * @returns {Promise<Object>} Paginated followers data
   */
  getFollowers: async (username, params = {}) => {
    try {
      const response = await retryRequest(() => usersApi.getFollowers(username, params));
      return response.data;
    } catch (error) {
      throw new UserApiError(
        'Failed to fetch followers',
        error.response?.status,
        error.response?.data
      );
    }
  },

  /**
   * Get user's following
   * @param {string} username - Username to get following for
   * @param {Object} params - Query parameters (page, page_size, etc.)
   * @returns {Promise<Object>} Paginated following data
   */
  getFollowing: async (username, params = {}) => {
    try {
      const response = await retryRequest(() => usersApi.getFollowing(username, params));
      return response.data;
    } catch (error) {
      throw new UserApiError(
        'Failed to fetch following',
        error.response?.status,
        error.response?.data
      );
    }
  },

  /**
   * Get suggested users
   * @param {Object} params - Query parameters (page, page_size, etc.)
   * @returns {Promise<Object>} Paginated suggested users data
   */
  getSuggestedUsers: async (params = {}) => {
    try {
      const response = await retryRequest(() => usersApi.getSuggestedUsers(params));
      return response.data;
    } catch (error) {
      throw new UserApiError(
        'Failed to fetch suggested users',
        error.response?.status,
        error.response?.data
      );
    }
  },

  /**
   * Search users
   * @param {string} query - Search query
   * @param {Object} params - Query parameters (page, page_size, etc.)
   * @returns {Promise<Object>} Paginated search results
   */
  searchUsers: async (query, params = {}) => {
    try {
      const response = await retryRequest(() => usersApi.searchUsers(query, params));
      return response.data;
    } catch (error) {
      throw new UserApiError(
        'Failed to search users',
        error.response?.status,
        error.response?.data
      );
    }
  },

  /**
   * Get user's notifications
   * @param {Object} params - Query parameters (page, page_size, etc.)
   * @returns {Promise<Object>} Paginated notifications data
   */
  getNotifications: async (params = {}) => {
    try {
      const response = await retryRequest(() => usersApi.getNotifications(params));
      return response.data;
    } catch (error) {
      throw new UserApiError(
        'Failed to fetch notifications',
        error.response?.status,
        error.response?.data
      );
    }
  },

  /**
   * Mark notifications as read
   * @param {Array<string>} notificationIds - Array of notification IDs
   * @returns {Promise<void>}
   */
  markNotificationsRead: async (notificationIds) => {
    try {
      await retryRequest(() => usersApi.markNotificationsRead(notificationIds));
    } catch (error) {
      throw new UserApiError(
        'Failed to mark notifications as read',
        error.response?.status,
        error.response?.data
      );
    }
  },

  /**
   * Delete account
   * @returns {Promise<void>}
   */
  deleteAccount: async () => {
    try {
      await retryRequest(() => usersApi.deleteAccount());
    } catch (error) {
      throw new UserApiError(
        'Failed to delete account',
        error.response?.status,
        error.response?.data
      );
    }
  }
}; 