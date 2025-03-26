import { likesApi } from './index';
import { retryRequest } from '../base/retry';

/**
 * Service layer for likes-related API operations
 * Handles error handling, retries, and data transformation
 */
export const likesService = {
  /**
   * Toggle like status for a photo
   * @param {string} photoId - ID of the photo to like/unlike
   * @returns {Promise<Object>} Like status and message
   */
  toggleLike: async (photoId) => {
    try {
      const response = await retryRequest(() => likesApi.toggleLike(photoId));
      return response.data;
    } catch (error) {
      throw new Error(
        'Failed to toggle like status',
        error.response?.status,
        error.response?.data
      );
    }
  },

  /**
   * Get photo's likes
   * @param {string} photoId - ID of the photo to get likes for
   * @returns {Promise<Array<Object>>} Array of likes
   */
  getPhotoLikes: async (photoId) => {
    try {
      const response = await retryRequest(() => likesApi.getPhotoLikes(photoId));
      return response.data;
    } catch (error) {
      throw new Error(
        'Failed to fetch photo likes',
        error.response?.status,
        error.response?.data
      );
    }
  },

  /**
   * Get user's liked photos
   * @param {string} username - Username to get liked photos for
   * @returns {Promise<Array<Object>>} Array of liked photos
   */
  getUserLikes: async (username) => {
    try {
      const response = await retryRequest(() => likesApi.getUserLikes(username));
      return response.data;
    } catch (error) {
      throw new Error(
        'Failed to fetch user likes',
        error.response?.status,
        error.response?.data
      );
    }
  },

  /**
   * Get recent likes
   * @returns {Promise<Array<Object>>} Array of recent likes
   */
  getRecent: async () => {
    try {
      const response = await retryRequest(() => likesApi.getRecent());
      return response.data;
    } catch (error) {
      throw new Error(
        'Failed to fetch recent likes',
        error.response?.status,
        error.response?.data
      );
    }
  },

  /**
   * Get like statistics for a photo
   * @param {string} photoId - ID of the photo to get stats for
   * @returns {Promise<Object>} Like statistics
   */
  getStats: async (photoId) => {
    try {
      const response = await retryRequest(() => likesApi.getStats(photoId));
      return response.data;
    } catch (error) {
      throw new Error(
        'Failed to fetch like statistics',
        error.response?.status,
        error.response?.data
      );
    }
  },

  /**
   * Get user's like statistics
   * @param {string} username - Username to get stats for
   * @returns {Promise<Object>} User's like statistics
   */
  getUserStats: async (username) => {
    try {
      const response = await retryRequest(() => likesApi.getUserStats(username));
      return response.data;
    } catch (error) {
      throw new Error(
        'Failed to fetch user like statistics',
        error.response?.status,
        error.response?.data
      );
    }
  },

  /**
   * Check if current user likes a specific photo
   * @param {string} photoId - ID of the photo to check like status for
   * @returns {Promise<boolean>} Whether the photo is liked
   */
  checkLike: async (photoId) => {
    try {
      const response = await retryRequest(() => likesApi.checkLike(photoId));
      return response.data.liked;
    } catch (error) {
      throw new Error(
        'Failed to check like status',
        error.response?.status,
        error.response?.data
      );
    }
  }
}; 