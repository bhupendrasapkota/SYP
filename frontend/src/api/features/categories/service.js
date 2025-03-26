import { categoriesApi } from './index';
import { retryRequest } from '../base/retry';

/**
 * Service layer for categories-related API operations
 * Handles error handling, retries, and data transformation
 */
export const categoriesService = {
  /**
   * Get all categories
   * @returns {Promise<Array<Object>>} Array of categories
   */
  getAllCategories: async () => {
    try {
      const response = await retryRequest(() => categoriesApi.getAllCategories());
      return response.data;
    } catch (error) {
      throw new Error(
        'Failed to fetch categories',
        error.response?.status,
        error.response?.data
      );
    }
  },

  /**
   * Get category details
   * @param {string} categoryId - Category ID
   * @returns {Promise<Object>} Category data
   */
  getCategory: async (categoryId) => {
    try {
      const response = await retryRequest(() => categoriesApi.getCategory(categoryId));
      return response.data;
    } catch (error) {
      throw new Error(
        'Failed to fetch category details',
        error.response?.status,
        error.response?.data
      );
    }
  },

  /**
   * Create a new category (admin only)
   * @param {Object} data - Category data
   * @returns {Promise<Object>} Created category data
   */
  createCategory: async (data) => {
    try {
      const response = await retryRequest(() => categoriesApi.createCategory(data));
      return response.data;
    } catch (error) {
      throw new Error(
        'Failed to create category',
        error.response?.status,
        error.response?.data
      );
    }
  },

  /**
   * Update a category (admin only)
   * @param {string} categoryId - Category ID
   * @param {Object} data - Updated category data
   * @returns {Promise<Object>} Updated category data
   */
  updateCategory: async (categoryId, data) => {
    try {
      const response = await retryRequest(() => categoriesApi.updateCategory(categoryId, data));
      return response.data;
    } catch (error) {
      throw new Error(
        'Failed to update category',
        error.response?.status,
        error.response?.data
      );
    }
  },

  /**
   * Delete a category (admin only)
   * @param {string} categoryId - Category ID
   * @returns {Promise<void>}
   */
  deleteCategory: async (categoryId) => {
    try {
      await retryRequest(() => categoriesApi.deleteCategory(categoryId));
    } catch (error) {
      throw new Error(
        'Failed to delete category',
        error.response?.status,
        error.response?.data
      );
    }
  },

  /**
   * Add photos to category
   * @param {string} categoryId - Category ID
   * @param {Array<string>} photoIds - Array of photo IDs
   * @returns {Promise<Object>} Response with added photos
   */
  addPhotos: async (categoryId, photoIds) => {
    try {
      const response = await retryRequest(() => categoriesApi.addPhotos(categoryId, photoIds));
      return response.data;
    } catch (error) {
      throw new Error(
        'Failed to add photos to category',
        error.response?.status,
        error.response?.data
      );
    }
  },

  /**
   * Remove photos from category
   * @param {string} categoryId - Category ID
   * @param {Array<string>} photoIds - Array of photo IDs
   * @returns {Promise<void>}
   */
  removePhotos: async (categoryId, photoIds) => {
    try {
      await retryRequest(() => categoriesApi.removePhotos(categoryId, photoIds));
    } catch (error) {
      throw new Error(
        'Failed to remove photos from category',
        error.response?.status,
        error.response?.data
      );
    }
  },

  /**
   * Get photos in a category
   * @param {string} categoryId - Category ID
   * @param {number} page - Page number (default: 1)
   * @param {number} pageSize - Number of items per page (default: 10)
   * @returns {Promise<Object>} Paginated photos data
   */
  getCategoryPhotos: async (categoryId, page = 1, pageSize = 10) => {
    try {
      const response = await retryRequest(() => categoriesApi.getCategoryPhotos(categoryId, page, pageSize));
      return response.data;
    } catch (error) {
      throw new Error(
        'Failed to fetch category photos',
        error.response?.status,
        error.response?.data
      );
    }
  },

  /**
   * Get popular categories
   * @returns {Promise<Array<Object>>} Array of popular categories
   */
  getPopular: async () => {
    try {
      const response = await retryRequest(() => categoriesApi.getPopular());
      return response.data;
    } catch (error) {
      throw new Error(
        'Failed to fetch popular categories',
        error.response?.status,
        error.response?.data
      );
    }
  },

  /**
   * Get category statistics
   * @param {string} categoryId - Category ID
   * @returns {Promise<Object>} Category statistics
   */
  getStats: async (categoryId) => {
    try {
      const response = await retryRequest(() => categoriesApi.getStats(categoryId));
      return response.data;
    } catch (error) {
      throw new Error(
        'Failed to fetch category statistics',
        error.response?.status,
        error.response?.data
      );
    }
  }
}; 