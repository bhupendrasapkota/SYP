import { photosService } from './service';
import { BaseManager } from '../base/BaseManager';

/**
 * PhotosManager handles photos-related operations and state management
 * Extends BaseManager for common functionality
 */
export class PhotosManager extends BaseManager {
  constructor() {
    super();
    // Initialize caches
    this.photos = new Map(); // Cache photos by ID
    this.userPhotos = new Map(); // Cache user photos by username
    this.feedPhotos = null; // Cache feed photos
    this.trendingPhotos = null; // Cache trending photos
    this.featuredPhotos = null; // Cache featured photos
    this.searchResults = new Map(); // Cache search results by query
    this.photoStats = new Map(); // Cache photo statistics by ID
  }

  /**
   * Upload a new photo
   * @param {FormData} formData - Form data containing photo file and metadata
   * @returns {Promise<Object>} Created photo data
   */
  async uploadPhoto(formData) {
    try {
      this.setLoading(true);
      const data = await photosService.uploadPhoto(formData);
      
      // Update caches
      this.photos.set(data.id, data);
      this.updateUserPhotosCache(data.user);
      this.updateFeedCache();
      this.updateTrendingCache();
      this.updateFeaturedCache();
      
      return data;
    } catch (error) {
      this.setError(error);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Get a specific photo
   * @param {string} photoId - ID of the photo to retrieve
   * @returns {Promise<Object>} Photo data
   */
  async getPhoto(photoId) {
    try {
      this.setLoading(true);
      
      if (this.photos.has(photoId)) {
        return this.photos.get(photoId);
      }

      const data = await photosService.getPhoto(photoId);
      this.photos.set(photoId, data);
      
      return data;
    } catch (error) {
      this.setError(error);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Update a photo
   * @param {string} photoId - ID of the photo to update
   * @param {Object} data - Updated photo data
   * @returns {Promise<Object>} Updated photo data
   */
  async updatePhoto(photoId, data) {
    try {
      this.setLoading(true);
      const updatedData = await photosService.updatePhoto(photoId, data);
      
      // Update caches
      this.photos.set(photoId, updatedData);
      this.updateUserPhotosCache(updatedData.user);
      this.updateFeedCache();
      this.updateTrendingCache();
      this.updateFeaturedCache();
      
      return updatedData;
    } catch (error) {
      this.setError(error);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Delete a photo
   * @param {string} photoId - ID of the photo to delete
   * @returns {Promise<void>}
   */
  async deletePhoto(photoId) {
    try {
      this.setLoading(true);
      const photo = this.photos.get(photoId);
      await photosService.deletePhoto(photoId);
      
      // Update caches
      this.photos.delete(photoId);
      if (photo) {
        this.updateUserPhotosCache(photo.user);
      }
      this.updateFeedCache();
      this.updateTrendingCache();
      this.updateFeaturedCache();
    } catch (error) {
      this.setError(error);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Get user's photos
   * @param {string} username - Username to get photos for
   * @param {Object} params - Query parameters (page, page_size, etc.)
   * @returns {Promise<Object>} Paginated photos data
   */
  async getUserPhotos(username, params = {}) {
    try {
      this.setLoading(true);
      
      const cacheKey = `${username}-${JSON.stringify(params)}`;
      if (this.userPhotos.has(cacheKey)) {
        return this.userPhotos.get(cacheKey);
      }

      const data = await photosService.getUserPhotos(username, params);
      this.userPhotos.set(cacheKey, data);
      
      return data;
    } catch (error) {
      this.setError(error);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Get feed photos
   * @param {Object} params - Query parameters (page, page_size, etc.)
   * @returns {Promise<Object>} Paginated feed photos data
   */
  async getFeed(params = {}) {
    try {
      this.setLoading(true);
      
      const cacheKey = JSON.stringify(params);
      if (this.feedPhotos?.key === cacheKey) {
        return this.feedPhotos.data;
      }

      const data = await photosService.getFeed(params);
      this.feedPhotos = { key: cacheKey, data };
      
      return data;
    } catch (error) {
      this.setError(error);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Get trending photos
   * @param {Object} params - Query parameters (page, page_size, etc.)
   * @returns {Promise<Object>} Paginated trending photos data
   */
  async getTrending(params = {}) {
    try {
      this.setLoading(true);
      
      const cacheKey = JSON.stringify(params);
      if (this.trendingPhotos?.key === cacheKey) {
        return this.trendingPhotos.data;
      }

      const data = await photosService.getTrending(params);
      this.trendingPhotos = { key: cacheKey, data };
      
      return data;
    } catch (error) {
      this.setError(error);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Get featured photos
   * @param {Object} params - Query parameters (page, page_size, etc.)
   * @returns {Promise<Object>} Paginated featured photos data
   */
  async getFeatured(params = {}) {
    try {
      this.setLoading(true);
      
      const cacheKey = JSON.stringify(params);
      if (this.featuredPhotos?.key === cacheKey) {
        return this.featuredPhotos.data;
      }

      const data = await photosService.getFeatured(params);
      this.featuredPhotos = { key: cacheKey, data };
      
      return data;
    } catch (error) {
      this.setError(error);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Search photos
   * @param {string} query - Search query
   * @param {Object} params - Query parameters (page, page_size, etc.)
   * @returns {Promise<Object>} Paginated search results
   */
  async searchPhotos(query, params = {}) {
    try {
      this.setLoading(true);
      
      const cacheKey = `${query}-${JSON.stringify(params)}`;
      if (this.searchResults.has(cacheKey)) {
        return this.searchResults.get(cacheKey);
      }

      const data = await photosService.searchPhotos(query, params);
      this.searchResults.set(cacheKey, data);
      
      return data;
    } catch (error) {
      this.setError(error);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Get photo statistics
   * @param {string} photoId - ID of the photo to get stats for
   * @returns {Promise<Object>} Photo statistics
   */
  async getStats(photoId) {
    try {
      this.setLoading(true);
      
      if (this.photoStats.has(photoId)) {
        return this.photoStats.get(photoId);
      }

      const data = await photosService.getStats(photoId);
      this.photoStats.set(photoId, data);
      
      return data;
    } catch (error) {
      this.setError(error);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Report a photo
   * @param {string} photoId - ID of the photo to report
   * @param {string} reason - Reason for reporting
   * @returns {Promise<void>}
   */
  async reportPhoto(photoId, reason) {
    try {
      this.setLoading(true);
      await photosService.reportPhoto(photoId, reason);
    } catch (error) {
      this.setError(error);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Update user photos cache
   * @private
   * @param {string} username - Username
   */
  updateUserPhotosCache(username) {
    for (const [key] of this.userPhotos) {
      if (key.startsWith(username)) {
        this.userPhotos.delete(key);
      }
    }
  }

  /**
   * Update feed cache
   * @private
   */
  updateFeedCache() {
    this.feedPhotos = null;
  }

  /**
   * Update trending cache
   * @private
   */
  updateTrendingCache() {
    this.trendingPhotos = null;
  }

  /**
   * Update featured cache
   * @private
   */
  updateFeaturedCache() {
    this.featuredPhotos = null;
  }

  /**
   * Clear all data and reset state
   */
  clearData() {
    super.clearData();
    this.photos.clear();
    this.userPhotos.clear();
    this.feedPhotos = null;
    this.trendingPhotos = null;
    this.featuredPhotos = null;
    this.searchResults.clear();
    this.photoStats.clear();
  }
}

// Create a singleton instance
const photosManager = new PhotosManager();
export default photosManager; 