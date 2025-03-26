import { downloadsApi } from './index';
import { retryRequest } from '../base/retry';

/**
 * Service layer for downloads-related API operations
 * Handles error handling, retries, and data transformation
 */
export const downloadsService = {
  /**
   * Track a photo download
   * @param {string} photoId - Photo ID
   * @returns {Promise<Object>} Download data
   */
  trackDownload: async (photoId) => {
    try {
      const response = await retryRequest(() => downloadsApi.trackDownload(photoId));
      return response.data;
    } catch (error) {
      throw new Error(
        'Failed to track download',
        error.response?.status,
        error.response?.data
      );
    }
  },

  /**
   * Get user's download history
   * @param {string} userId - User ID (optional, defaults to current user)
   * @returns {Promise<Array<Object>>} Array of downloads
   */
  getHistory: async (userId) => {
    try {
      const response = await retryRequest(() => downloadsApi.getHistory(userId));
      return response.data;
    } catch (error) {
      throw new Error(
        'Failed to fetch download history',
        error.response?.status,
        error.response?.data
      );
    }
  },

  /**
   * Get download statistics
   * @param {string} userId - User ID (optional, defaults to current user)
   * @returns {Promise<Object>} Download statistics
   */
  getStats: async (userId) => {
    try {
      const response = await retryRequest(() => downloadsApi.getStats(userId));
      return response.data;
    } catch (error) {
      throw new Error(
        'Failed to fetch download statistics',
        error.response?.status,
        error.response?.data
      );
    }
  },

  /**
   * Get most downloaded photos
   * @returns {Promise<Array<Object>>} Array of most downloaded photos
   */
  getMostDownloaded: async () => {
    try {
      const response = await retryRequest(() => downloadsApi.getMostDownloaded());
      return response.data;
    } catch (error) {
      throw new Error(
        'Failed to fetch most downloaded photos',
        error.response?.status,
        error.response?.data
      );
    }
  },

  /**
   * Check download limits
   * @returns {Promise<Object>} Download limits and usage
   */
  checkLimits: async () => {
    try {
      const response = await retryRequest(() => downloadsApi.checkLimits());
      return response.data;
    } catch (error) {
      throw new Error(
        'Failed to check download limits',
        error.response?.status,
        error.response?.data
      );
    }
  },

  /**
   * Remove download by photo ID
   * @param {string} photoId - Photo ID
   * @returns {Promise<void>}
   */
  removeByPhoto: async (photoId) => {
    try {
      await retryRequest(() => downloadsApi.removeByPhoto(photoId));
    } catch (error) {
      throw new Error(
        'Failed to remove download',
        error.response?.status,
        error.response?.data
      );
    }
  }
}; 