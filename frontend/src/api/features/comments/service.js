import { commentsApi } from './index';
import { retryRequest } from '../base/retry';

/**
 * Service layer for comments-related API operations
 * Handles error handling, retries, and data transformation
 */
export const commentsService = {
  /**
   * Create a new comment
   * @param {Object} data - Comment data
   * @returns {Promise<Object>} Created comment data
   */
  createComment: async (data) => {
    try {
      const response = await retryRequest(() => commentsApi.createComment(data));
      return response.data;
    } catch (error) {
      throw new Error(
        'Failed to create comment',
        error.response?.status,
        error.response?.data
      );
    }
  },

  /**
   * Get comment details
   * @param {string} commentId - Comment ID
   * @returns {Promise<Object>} Comment data
   */
  getComment: async (commentId) => {
    try {
      const response = await retryRequest(() => commentsApi.getComment(commentId));
      return response.data;
    } catch (error) {
      throw new Error(
        'Failed to fetch comment details',
        error.response?.status,
        error.response?.data
      );
    }
  },

  /**
   * Update a comment
   * @param {string} commentId - Comment ID
   * @param {Object} data - Updated comment data
   * @returns {Promise<Object>} Updated comment data
   */
  updateComment: async (commentId, data) => {
    try {
      const response = await retryRequest(() => commentsApi.updateComment(commentId, data));
      return response.data;
    } catch (error) {
      throw new Error(
        'Failed to update comment',
        error.response?.status,
        error.response?.data
      );
    }
  },

  /**
   * Delete a comment
   * @param {string} commentId - Comment ID
   * @returns {Promise<void>}
   */
  deleteComment: async (commentId) => {
    try {
      await retryRequest(() => commentsApi.deleteComment(commentId));
    } catch (error) {
      throw new Error(
        'Failed to delete comment',
        error.response?.status,
        error.response?.data
      );
    }
  },

  /**
   * Get comments for a photo
   * @param {string} photoId - Photo ID
   * @param {number} page - Page number (default: 1)
   * @param {number} pageSize - Number of items per page (default: 20)
   * @returns {Promise<Object>} Paginated comments data
   */
  getPhotoComments: async (photoId, page = 1, pageSize = 20) => {
    try {
      const response = await retryRequest(() => commentsApi.getPhotoComments(photoId, page, pageSize));
      return response.data;
    } catch (error) {
      throw new Error(
        'Failed to fetch photo comments',
        error.response?.status,
        error.response?.data
      );
    }
  },

  /**
   * Get user's comments
   * @param {string} userId - User ID (optional, defaults to current user)
   * @returns {Promise<Array<Object>>} Array of comments
   */
  getUserComments: async (userId) => {
    try {
      const response = await retryRequest(() => commentsApi.getUserComments(userId));
      return response.data;
    } catch (error) {
      throw new Error(
        'Failed to fetch user comments',
        error.response?.status,
        error.response?.data
      );
    }
  },

  /**
   * Get recent comments
   * @returns {Promise<Array<Object>>} Array of recent comments
   */
  getRecent: async () => {
    try {
      const response = await retryRequest(() => commentsApi.getRecent());
      return response.data;
    } catch (error) {
      throw new Error(
        'Failed to fetch recent comments',
        error.response?.status,
        error.response?.data
      );
    }
  },

  /**
   * Get comment statistics for a photo
   * @param {string} photoId - Photo ID
   * @returns {Promise<Object>} Comment statistics
   */
  getStats: async (photoId) => {
    try {
      const response = await retryRequest(() => commentsApi.getStats(photoId));
      return response.data;
    } catch (error) {
      throw new Error(
        'Failed to fetch comment statistics',
        error.response?.status,
        error.response?.data
      );
    }
  },

  /**
   * Get user's comment statistics
   * @param {string} userId - User ID (optional, defaults to current user)
   * @returns {Promise<Object>} User comment statistics
   */
  getUserStats: async (userId) => {
    try {
      const response = await retryRequest(() => commentsApi.getUserStats(userId));
      return response.data;
    } catch (error) {
      throw new Error(
        'Failed to fetch user comment statistics',
        error.response?.status,
        error.response?.data
      );
    }
  },

  /**
   * Report a comment
   * @param {string} commentId - Comment ID
   * @param {Object} data - Report data
   * @returns {Promise<void>}
   */
  reportComment: async (commentId, data) => {
    try {
      await retryRequest(() => commentsApi.reportComment(commentId, data));
    } catch (error) {
      throw new Error(
        'Failed to report comment',
        error.response?.status,
        error.response?.data
      );
    }
  }
}; 