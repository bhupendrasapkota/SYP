import { collectionsApi } from './index';
import { retryRequest } from '../base/retry';

/**
 * Service layer for collections-related API operations
 * Handles error handling, retries, and data transformation
 */
export const collectionsService = {
  /**
   * Get user's collections
   * @param {number} userId - User ID
   * @param {number} page - Page number (default: 1)
   * @param {number} pageSize - Number of items per page (default: 10)
   * @returns {Promise<Object>} Paginated collections data
   */
  getUserCollections: async (userId, page = 1, pageSize = 10) => {
    try {
      const response = await retryRequest(() => collectionsApi.getUserCollections(userId, page, pageSize));
      return response.data;
    } catch (error) {
      throw new Error(
        'Failed to fetch user collections',
        error.response?.status,
        error.response?.data
      );
    }
  },

  /**
   * Get collection details
   * @param {number} collectionId - Collection ID
   * @returns {Promise<Object>} Collection data
   */
  getCollection: async (collectionId) => {
    try {
      const response = await retryRequest(() => collectionsApi.getCollection(collectionId));
      return response.data;
    } catch (error) {
      throw new Error(
        'Failed to fetch collection details',
        error.response?.status,
        error.response?.data
      );
    }
  },

  /**
   * Create a new collection
   * @param {Object} data - Collection data
   * @returns {Promise<Object>} Created collection data
   */
  createCollection: async (data) => {
    try {
      const response = await retryRequest(() => collectionsApi.createCollection(data));
      return response.data;
    } catch (error) {
      throw new Error(
        'Failed to create collection',
        error.response?.status,
        error.response?.data
      );
    }
  },

  /**
   * Update a collection
   * @param {number} collectionId - Collection ID
   * @param {Object} data - Updated collection data
   * @returns {Promise<Object>} Updated collection data
   */
  updateCollection: async (collectionId, data) => {
    try {
      const response = await retryRequest(() => collectionsApi.updateCollection(collectionId, data));
      return response.data;
    } catch (error) {
      throw new Error(
        'Failed to update collection',
        error.response?.status,
        error.response?.data
      );
    }
  },

  /**
   * Delete a collection
   * @param {number} collectionId - Collection ID
   * @returns {Promise<void>}
   */
  deleteCollection: async (collectionId) => {
    try {
      await retryRequest(() => collectionsApi.deleteCollection(collectionId));
    } catch (error) {
      throw new Error(
        'Failed to delete collection',
        error.response?.status,
        error.response?.data
      );
    }
  },

  /**
   * Add photos to collection
   * @param {number} collectionId - Collection ID
   * @param {Array<number>} photoIds - Array of photo IDs
   * @returns {Promise<Object>} Updated collection data
   */
  addPhotos: async (collectionId, photoIds) => {
    try {
      const response = await retryRequest(() => collectionsApi.addPhotos(collectionId, photoIds));
      return response.data;
    } catch (error) {
      throw new Error(
        'Failed to add photos to collection',
        error.response?.status,
        error.response?.data
      );
    }
  },

  /**
   * Remove photos from collection
   * @param {number} collectionId - Collection ID
   * @param {Array<number>} photoIds - Array of photo IDs
   * @returns {Promise<void>}
   */
  removePhotos: async (collectionId, photoIds) => {
    try {
      await retryRequest(() => collectionsApi.removePhotos(collectionId, photoIds));
    } catch (error) {
      throw new Error(
        'Failed to remove photos from collection',
        error.response?.status,
        error.response?.data
      );
    }
  },

  /**
   * Toggle like on collection
   * @param {number} collectionId - Collection ID
   * @returns {Promise<Object>} Updated collection data
   */
  toggleLike: async (collectionId) => {
    try {
      const response = await retryRequest(() => collectionsApi.toggleLike(collectionId));
      return response.data;
    } catch (error) {
      throw new Error(
        'Failed to toggle collection like',
        error.response?.status,
        error.response?.data
      );
    }
  },

  /**
   * Toggle follow on collection
   * @param {number} collectionId - Collection ID
   * @returns {Promise<Object>} Updated collection data
   */
  toggleFollow: async (collectionId) => {
    try {
      const response = await retryRequest(() => collectionsApi.toggleFollow(collectionId));
      return response.data;
    } catch (error) {
      throw new Error(
        'Failed to toggle collection follow',
        error.response?.status,
        error.response?.data
      );
    }
  },

  /**
   * Get featured collections
   * @returns {Promise<Array<Object>>} Array of featured collections
   */
  getFeatured: async () => {
    try {
      const response = await retryRequest(() => collectionsApi.getFeatured());
      return response.data;
    } catch (error) {
      throw new Error(
        'Failed to fetch featured collections',
        error.response?.status,
        error.response?.data
      );
    }
  },

  /**
   * Get trending collections
   * @param {number} days - Number of days to consider (default: 7)
   * @returns {Promise<Array<Object>>} Array of trending collections
   */
  getTrending: async (days = 7) => {
    try {
      const response = await retryRequest(() => collectionsApi.getTrending(days));
      return response.data;
    } catch (error) {
      throw new Error(
        'Failed to fetch trending collections',
        error.response?.status,
        error.response?.data
      );
    }
  },

  /**
   * Get collection statistics
   * @param {number} collectionId - Collection ID
   * @returns {Promise<Object>} Collection statistics
   */
  getStats: async (collectionId) => {
    try {
      const response = await retryRequest(() => collectionsApi.getStats(collectionId));
      return response.data;
    } catch (error) {
      throw new Error(
        'Failed to fetch collection statistics',
        error.response?.status,
        error.response?.data
      );
    }
  },

  /**
   * Get collection photos
   * @param {number} collectionId - Collection ID
   * @param {number} page - Page number (default: 1)
   * @param {number} pageSize - Number of items per page (default: 10)
   * @returns {Promise<Object>} Paginated photos data
   */
  getCollectionPhotos: async (collectionId, page = 1, pageSize = 10) => {
    try {
      const response = await retryRequest(() => collectionsApi.getCollectionPhotos(collectionId, page, pageSize));
      return response.data;
    } catch (error) {
      throw new Error(
        'Failed to fetch collection photos',
        error.response?.status,
        error.response?.data
      );
    }
  }
}; 