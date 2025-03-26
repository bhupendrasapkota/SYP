import { followersApi } from './index';
import { retryRequest } from '../base/retry';

/**
 * Service layer for followers-related API operations
 * Handles error handling, retries, and data transformation
 */
export const followersService = {
  /**
   * Toggle follow status for a user
   * @param {string} username - Username to follow/unfollow
   * @returns {Promise<Object>} Follow status and message
   */
  toggleFollow: async (username) => {
    try {
      const response = await retryRequest(() => followersApi.toggleFollow(username));
      return response.data;
    } catch (error) {
      throw new Error(
        'Failed to toggle follow status',
        error.response?.status,
        error.response?.data
      );
    }
  },

  /**
   * Get user's followers
   * @param {string} username - Username to get followers for
   * @returns {Promise<Array<Object>>} Array of followers
   */
  getFollowers: async (username) => {
    try {
      const response = await retryRequest(() => followersApi.getFollowers(username));
      return response.data;
    } catch (error) {
      throw new Error(
        'Failed to fetch followers',
        error.response?.status,
        error.response?.data
      );
    }
  },

  /**
   * Get users that a user is following
   * @param {string} username - Username to get following for
   * @returns {Promise<Array<Object>>} Array of following users
   */
  getFollowing: async (username) => {
    try {
      const response = await retryRequest(() => followersApi.getFollowing(username));
      return response.data;
    } catch (error) {
      throw new Error(
        'Failed to fetch following users',
        error.response?.status,
        error.response?.data
      );
    }
  },

  /**
   * Get follower statistics
   * @param {string} username - Username to get stats for
   * @returns {Promise<Object>} Follower statistics
   */
  getStats: async (username) => {
    try {
      const response = await retryRequest(() => followersApi.getStats(username));
      return response.data;
    } catch (error) {
      throw new Error(
        'Failed to fetch follower statistics',
        error.response?.status,
        error.response?.data
      );
    }
  },

  /**
   * Check if current user follows a specific user
   * @param {string} username - Username to check follow status for
   * @returns {Promise<boolean>} Whether the user is being followed
   */
  checkFollow: async (username) => {
    try {
      const response = await retryRequest(() => followersApi.checkFollow(username));
      return response.data.following;
    } catch (error) {
      throw new Error(
        'Failed to check follow status',
        error.response?.status,
        error.response?.data
      );
    }
  },

  /**
   * Get suggested users to follow
   * @returns {Promise<Array<Object>>} Array of suggested users
   */
  getSuggestedUsers: async () => {
    try {
      const response = await retryRequest(() => followersApi.getSuggestedUsers());
      return response.data;
    } catch (error) {
      throw new Error(
        'Failed to fetch suggested users',
        error.response?.status,
        error.response?.data
      );
    }
  }
}; 