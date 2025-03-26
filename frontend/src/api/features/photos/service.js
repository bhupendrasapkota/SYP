import { photosApi } from './index';
import { retryRequest } from '../base/retry';
import { handleApiError } from '../base/error';

/**
 * Service layer for photos-related API operations
 * Handles error handling, retries, and data transformation
 */
export const photosService = {
  /**
   * Upload a new photo
   * @param {FormData} formData - Form data containing photo file and metadata
   * @returns {Promise<Object>} Created photo data
   */
  uploadPhoto: async (formData) => {
    try {
      const response = await retryRequest(() => photosApi.uploadPhoto(formData));
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get a specific photo
   * @param {string} photoId - ID of the photo to retrieve
   * @returns {Promise<Object>} Photo data
   */
  getPhoto: async (photoId) => {
    try {
      const response = await retryRequest(() => photosApi.getPhoto(photoId));
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Update a photo
   * @param {string} photoId - ID of the photo to update
   * @param {Object} data - Updated photo data
   * @returns {Promise<Object>} Updated photo data
   */
  updatePhoto: async (photoId, data) => {
    try {
      const response = await retryRequest(() => photosApi.updatePhoto(photoId, data));
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Delete a photo
   * @param {string} photoId - ID of the photo to delete
   * @returns {Promise<void>}
   */
  deletePhoto: async (photoId) => {
    try {
      await retryRequest(() => photosApi.deletePhoto(photoId));
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get user's photos
   * @param {string} username - Username to get photos for
   * @param {Object} params - Query parameters (page, page_size, etc.)
   * @returns {Promise<Object>} Paginated photos data
   */
  getUserPhotos: async (username, params = {}) => {
    try {
      const response = await retryRequest(() => photosApi.getUserPhotos(username, params));
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get feed photos
   * @param {Object} params - Query parameters (page, page_size, etc.)
   * @returns {Promise<Object>} Paginated feed photos data
   */
  getFeed: async (params = {}) => {
    try {
      const response = await retryRequest(() => photosApi.getFeed(params));
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get trending photos
   * @param {Object} params - Query parameters (page, page_size, etc.)
   * @returns {Promise<Object>} Paginated trending photos data
   */
  getTrending: async (params = {}) => {
    try {
      const response = await retryRequest(() => photosApi.getTrending(params));
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get featured photos
   * @param {Object} params - Query parameters (page, page_size, etc.)
   * @returns {Promise<Object>} Paginated featured photos data
   */
  getFeatured: async (params = {}) => {
    try {
      const response = await retryRequest(() => photosApi.getFeatured(params));
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Search photos
   * @param {string} query - Search query
   * @param {Object} params - Query parameters (page, page_size, etc.)
   * @returns {Promise<Object>} Paginated search results
   */
  searchPhotos: async (query, params = {}) => {
    try {
      const response = await retryRequest(() => photosApi.searchPhotos(query, params));
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get photo statistics
   * @param {string} photoId - ID of the photo to get stats for
   * @returns {Promise<Object>} Photo statistics
   */
  getStats: async (photoId) => {
    try {
      const response = await retryRequest(() => photosApi.getStats(photoId));
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Report a photo
   * @param {string} photoId - ID of the photo to report
   * @param {string} reason - Reason for reporting
   * @returns {Promise<void>}
   */
  reportPhoto: async (photoId, reason) => {
    try {
      await retryRequest(() => photosApi.reportPhoto(photoId, reason));
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get all photos with pagination
   * @param {number} page - Page number (default: 1)
   * @param {number} pageSize - Number of items per page (default: 10)
   * @returns {Promise<Object>} Paginated photos data
   */
  getAllPhotos: async (page = 1, pageSize = 10) => {
    try {
      const response = await retryRequest(() => photosApi.getAllPhotos(page, pageSize));
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get user's photo gallery
   * @param {string} username - Username
   * @param {number} page - Page number (default: 1)
   * @param {number} pageSize - Number of items per page (default: 10)
   * @param {string} ordering - Field to order by (default: '-upload_date')
   * @returns {Promise<Object>} User's gallery data
   */
  getUserGallery: async (username, page = 1, pageSize = 10, ordering = '-upload_date') => {
    try {
      const response = await retryRequest(() => photosApi.getUserGallery(username, page, pageSize, ordering));
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Like a photo
   * @param {number} id - Photo ID
   * @returns {Promise<Object>} Updated photo data
   */
  likePhoto: async (id) => {
    try {
      const response = await retryRequest(() => photosApi.likePhoto(id));
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Unlike a photo
   * @param {number} id - Photo ID
   * @returns {Promise<Object>} Updated photo data
   */
  unlikePhoto: async (id) => {
    try {
      const response = await retryRequest(() => photosApi.unlikePhoto(id));
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Download a photo
   * @param {number} id - Photo ID
   * @returns {Promise<Object>} Download data
   */
  downloadPhoto: async (id) => {
    try {
      const response = await retryRequest(() => photosApi.downloadPhoto(id));
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Filter photos
   * @param {Object} filters - Filter criteria
   * @param {number} page - Page number (default: 1)
   * @param {number} pageSize - Number of items per page (default: 10)
   * @returns {Promise<Object>} Filtered photos data
   */
  filterPhotos: async (filters, page = 1, pageSize = 10) => {
    try {
      const response = await retryRequest(() => photosApi.getAllPhotos(page, pageSize));
      return response.data.filter(photo => {
        return Object.entries(filters).every(([key, value]) => photo[key] === value);
      });
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get all posts with pagination
   * @param {number} page - Page number (default: 1)
   * @param {number} pageSize - Number of items per page (default: 10)
   * @returns {Promise<Object>} Paginated posts data
   */
  getAllPosts: async (page = 1, pageSize = 10) => {
    try {
      const response = await retryRequest(() => photosApi.getAllPhotos(page, pageSize));
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get most downloaded posts
   * @param {number} page - Page number (default: 1)
   * @param {number} pageSize - Number of items per page (default: 10)
   * @returns {Promise<Object>} Most downloaded posts data
   */
  getMostDownloadedPosts: async (page = 1, pageSize = 10) => {
    try {
      const response = await retryRequest(() => photosApi.getTrending({
        algorithm: 'downloads',
        page,
        pageSize,
        include_user_photos: true
      }));
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get user's posts
   * @param {string} username - Username
   * @param {number} page - Page number (default: 1)
   * @param {number} pageSize - Number of items per page (default: 10)
   * @returns {Promise<Object>} User's posts data
   */
  getUserPosts: async (username, page = 1, pageSize = 10) => {
    try {
      const response = await retryRequest(() => photosApi.getUserGallery(username, page, pageSize));
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get user's most downloaded posts
   * @param {string} username - Username
   * @param {number} page - Page number (default: 1)
   * @param {number} pageSize - Number of items per page (default: 10)
   * @returns {Promise<Object>} User's most downloaded posts data
   */
  getUserMostDownloadedPosts: async (username, page = 1, pageSize = 10) => {
    try {
      const response = await retryRequest(() => photosApi.getUserGallery(username, page, pageSize, '-downloads_count'));
      return response.data.filter(post => post.downloads_count > 0);
    } catch (error) {
      throw handleApiError(error);
    }
  }
}; 