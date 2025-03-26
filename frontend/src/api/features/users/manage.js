import { usersService } from './service';
import { BaseManager } from '../base/BaseManager';

/**
 * UsersManager handles users-related operations and state management
 * Extends BaseManager for common functionality
 */
export class UsersManager extends BaseManager {
  constructor() {
    super();
    // Initialize caches
    this.profiles = new Map(); // Cache user profiles by username
    this.followers = new Map(); // Cache followers by username
    this.following = new Map(); // Cache following by username
    this.userStats = new Map(); // Cache user statistics by username
    this.suggestedUsers = null; // Cache suggested users
    this.notifications = null; // Cache notifications
  }

  /**
   * Get user profile
   * @param {string} username - Username to get profile for
   * @returns {Promise<Object>} User profile data
   */
  async getUserProfile(username) {
    try {
      this.setLoading(true);
      
      if (this.profiles.has(username)) {
        return this.profiles.get(username);
      }

      const data = await usersService.getUserProfile(username);
      this.profiles.set(username, data);
      
      return data;
    } catch (error) {
      this.setError(error);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Update user profile
   * @param {Object} data - Updated profile data
   * @returns {Promise<Object>} Updated profile data
   */
  async updateProfile(data) {
    try {
      this.setLoading(true);
      const updatedData = await usersService.updateProfile(data);
      
      // Update cache
      this.profiles.set(updatedData.username, updatedData);
      
      return updatedData;
    } catch (error) {
      this.setError(error);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Change password
   * @param {Object} data - Password change data
   * @returns {Promise<void>}
   */
  async changePassword(data) {
    try {
      this.setLoading(true);
      await usersService.changePassword(data);
    } catch (error) {
      this.setError(error);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Get user statistics
   * @param {string} username - Username to get stats for
   * @returns {Promise<Object>} User statistics
   */
  async getUserStats(username) {
    try {
      this.setLoading(true);
      
      if (this.userStats.has(username)) {
        return this.userStats.get(username);
      }

      const data = await usersService.getUserStats(username);
      this.userStats.set(username, data);
      
      return data;
    } catch (error) {
      this.setError(error);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Get user's followers
   * @param {string} username - Username to get followers for
   * @param {Object} params - Query parameters (page, page_size, etc.)
   * @returns {Promise<Object>} Paginated followers data
   */
  async getFollowers(username, params = {}) {
    try {
      this.setLoading(true);
      
      const cacheKey = `${username}-${JSON.stringify(params)}`;
      if (this.followers.has(cacheKey)) {
        return this.followers.get(cacheKey);
      }

      const data = await usersService.getFollowers(username, params);
      this.followers.set(cacheKey, data);
      
      return data;
    } catch (error) {
      this.setError(error);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Get user's following
   * @param {string} username - Username to get following for
   * @param {Object} params - Query parameters (page, page_size, etc.)
   * @returns {Promise<Object>} Paginated following data
   */
  async getFollowing(username, params = {}) {
    try {
      this.setLoading(true);
      
      const cacheKey = `${username}-${JSON.stringify(params)}`;
      if (this.following.has(cacheKey)) {
        return this.following.get(cacheKey);
      }

      const data = await usersService.getFollowing(username, params);
      this.following.set(cacheKey, data);
      
      return data;
    } catch (error) {
      this.setError(error);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Get suggested users
   * @param {Object} params - Query parameters (page, page_size, etc.)
   * @returns {Promise<Object>} Paginated suggested users data
   */
  async getSuggestedUsers(params = {}) {
    try {
      this.setLoading(true);
      
      const cacheKey = JSON.stringify(params);
      if (this.suggestedUsers?.key === cacheKey) {
        return this.suggestedUsers.data;
      }

      const data = await usersService.getSuggestedUsers(params);
      this.suggestedUsers = { key: cacheKey, data };
      
      return data;
    } catch (error) {
      this.setError(error);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Search users
   * @param {string} query - Search query
   * @param {Object} params - Query parameters (page, page_size, etc.)
   * @returns {Promise<Object>} Paginated search results
   */
  async searchUsers(query, params = {}) {
    try {
      this.setLoading(true);
      return await usersService.searchUsers(query, params);
    } catch (error) {
      this.setError(error);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Get user's notifications
   * @param {Object} params - Query parameters (page, page_size, etc.)
   * @returns {Promise<Object>} Paginated notifications data
   */
  async getNotifications(params = {}) {
    try {
      this.setLoading(true);
      
      const cacheKey = JSON.stringify(params);
      if (this.notifications?.key === cacheKey) {
        return this.notifications.data;
      }

      const data = await usersService.getNotifications(params);
      this.notifications = { key: cacheKey, data };
      
      return data;
    } catch (error) {
      this.setError(error);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Mark notifications as read
   * @param {Array<string>} notificationIds - Array of notification IDs
   * @returns {Promise<void>}
   */
  async markNotificationsRead(notificationIds) {
    try {
      this.setLoading(true);
      await usersService.markNotificationsRead(notificationIds);
      
      // Invalidate notifications cache
      this.notifications = null;
    } catch (error) {
      this.setError(error);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Delete account
   * @returns {Promise<void>}
   */
  async deleteAccount() {
    try {
      this.setLoading(true);
      await usersService.deleteAccount();
      
      // Clear all data
      this.clearData();
    } catch (error) {
      this.setError(error);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Clear all data and reset state
   */
  clearData() {
    super.clearData();
    this.profiles.clear();
    this.followers.clear();
    this.following.clear();
    this.userStats.clear();
    this.suggestedUsers = null;
    this.notifications = null;
  }
}

// Create a singleton instance
const usersManager = new UsersManager();
export default usersManager; 