import { collectionsService } from './service';
import { BaseManager } from '../base/BaseManager';

/**
 * Manager class for handling collections-related operations and state management
 * Extends BaseManager for common functionality
 */
export class CollectionsManager extends BaseManager {
  constructor() {
    super();
    // Initialize caches
    this.collectionsByUser = new Map(); // Cache collections by user ID
    this.collectionsById = new Map(); // Cache collections by collection ID
    this.collectionPhotos = new Map(); // Cache photos by collection ID
    this.collectionStats = new Map(); // Cache collection statistics
    this.featuredCollections = null; // Cache featured collections
    this.trendingCollections = new Map(); // Cache trending collections by days
  }

  /**
   * Get user's collections with caching
   * @param {number} userId - User ID
   * @param {number} page - Page number (default: 1)
   * @param {number} pageSize - Number of items per page (default: 10)
   * @returns {Promise<Object>} Paginated collections data
   */
  async getUserCollections(userId, page = 1, pageSize = 10) {
    try {
      this.setLoading(true);
      const cacheKey = `${userId}-${page}-${pageSize}`;
      
      // Check cache first
      if (this.collectionsByUser.has(cacheKey)) {
        return this.collectionsByUser.get(cacheKey);
      }

      const data = await collectionsService.getUserCollections(userId, page, pageSize);
      
      // Update cache
      this.collectionsByUser.set(cacheKey, data);
      
      // Update individual collection cache
      data.forEach(collection => {
        this.collectionsById.set(collection.id, collection);
      });

      return data;
    } catch (error) {
      this.setError(error);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Get collection details with caching
   * @param {number} collectionId - Collection ID
   * @returns {Promise<Object>} Collection data
   */
  async getCollection(collectionId) {
    try {
      this.setLoading(true);
      
      // Check cache first
      if (this.collectionsById.has(collectionId)) {
        return this.collectionsById.get(collectionId);
      }

      const data = await collectionsService.getCollection(collectionId);
      
      // Update cache
      this.collectionsById.set(collectionId, data);
      
      return data;
    } catch (error) {
      this.setError(error);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Create a new collection
   * @param {Object} data - Collection data
   * @returns {Promise<Object>} Created collection data
   */
  async createCollection(data) {
    try {
      this.setLoading(true);
      const collection = await collectionsService.createCollection(data);
      
      // Update caches
      this.collectionsById.set(collection.id, collection);
      this.updateUserCollectionsCache(collection.user.id);
      
      return collection;
    } catch (error) {
      this.setError(error);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Update a collection
   * @param {number} collectionId - Collection ID
   * @param {Object} data - Updated collection data
   * @returns {Promise<Object>} Updated collection data
   */
  async updateCollection(collectionId, data) {
    try {
      this.setLoading(true);
      const collection = await collectionsService.updateCollection(collectionId, data);
      
      // Update caches
      this.collectionsById.set(collectionId, collection);
      this.updateUserCollectionsCache(collection.user.id);
      
      return collection;
    } catch (error) {
      this.setError(error);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Delete a collection
   * @param {number} collectionId - Collection ID
   * @returns {Promise<void>}
   */
  async deleteCollection(collectionId) {
    try {
      this.setLoading(true);
      const collection = await this.getCollection(collectionId);
      await collectionsService.deleteCollection(collectionId);
      
      // Update caches
      this.collectionsById.delete(collectionId);
      this.collectionPhotos.delete(collectionId);
      this.collectionStats.delete(collectionId);
      this.updateUserCollectionsCache(collection.user.id);
    } catch (error) {
      this.setError(error);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Add photos to collection
   * @param {number} collectionId - Collection ID
   * @param {Array<number>} photoIds - Array of photo IDs
   * @returns {Promise<Object>} Updated collection data
   */
  async addPhotos(collectionId, photoIds) {
    try {
      this.setLoading(true);
      const collection = await collectionsService.addPhotos(collectionId, photoIds);
      
      // Update caches
      this.collectionsById.set(collectionId, collection);
      this.updateCollectionPhotosCache(collectionId);
      
      return collection;
    } catch (error) {
      this.setError(error);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Remove photos from collection
   * @param {number} collectionId - Collection ID
   * @param {Array<number>} photoIds - Array of photo IDs
   * @returns {Promise<void>}
   */
  async removePhotos(collectionId, photoIds) {
    try {
      this.setLoading(true);
      await collectionsService.removePhotos(collectionId, photoIds);
      
      // Update caches
      this.updateCollectionPhotosCache(collectionId);
    } catch (error) {
      this.setError(error);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Toggle like on collection
   * @param {number} collectionId - Collection ID
   * @returns {Promise<Object>} Updated collection data
   */
  async toggleLike(collectionId) {
    try {
      this.setLoading(true);
      const collection = await collectionsService.toggleLike(collectionId);
      
      // Update caches
      this.collectionsById.set(collectionId, collection);
      
      return collection;
    } catch (error) {
      this.setError(error);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Toggle follow on collection
   * @param {number} collectionId - Collection ID
   * @returns {Promise<Object>} Updated collection data
   */
  async toggleFollow(collectionId) {
    try {
      this.setLoading(true);
      const collection = await collectionsService.toggleFollow(collectionId);
      
      // Update caches
      this.collectionsById.set(collectionId, collection);
      
      return collection;
    } catch (error) {
      this.setError(error);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Get featured collections with caching
   * @returns {Promise<Array<Object>>} Array of featured collections
   */
  async getFeatured() {
    try {
      this.setLoading(true);
      
      // Check cache first
      if (this.featuredCollections) {
        return this.featuredCollections;
      }

      const data = await collectionsService.getFeatured();
      
      // Update cache
      this.featuredCollections = data;
      
      // Update individual collection cache
      data.forEach(collection => {
        this.collectionsById.set(collection.id, collection);
      });
      
      return data;
    } catch (error) {
      this.setError(error);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Get trending collections with caching
   * @param {number} days - Number of days to consider (default: 7)
   * @returns {Promise<Array<Object>>} Array of trending collections
   */
  async getTrending(days = 7) {
    try {
      this.setLoading(true);
      
      // Check cache first
      if (this.trendingCollections.has(days)) {
        return this.trendingCollections.get(days);
      }

      const data = await collectionsService.getTrending(days);
      
      // Update cache
      this.trendingCollections.set(days, data);
      
      // Update individual collection cache
      data.forEach(collection => {
        this.collectionsById.set(collection.id, collection);
      });
      
      return data;
    } catch (error) {
      this.setError(error);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Get collection statistics with caching
   * @param {number} collectionId - Collection ID
   * @returns {Promise<Object>} Collection statistics
   */
  async getStats(collectionId) {
    try {
      this.setLoading(true);
      
      // Check cache first
      if (this.collectionStats.has(collectionId)) {
        return this.collectionStats.get(collectionId);
      }

      const data = await collectionsService.getStats(collectionId);
      
      // Update cache
      this.collectionStats.set(collectionId, data);
      
      return data;
    } catch (error) {
      this.setError(error);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Get collection photos with caching
   * @param {number} collectionId - Collection ID
   * @param {number} page - Page number (default: 1)
   * @param {number} pageSize - Number of items per page (default: 10)
   * @returns {Promise<Object>} Paginated photos data
   */
  async getCollectionPhotos(collectionId, page = 1, pageSize = 10) {
    try {
      this.setLoading(true);
      const cacheKey = `${collectionId}-${page}-${pageSize}`;
      
      // Check cache first
      if (this.collectionPhotos.has(cacheKey)) {
        return this.collectionPhotos.get(cacheKey);
      }

      const data = await collectionsService.getCollectionPhotos(collectionId, page, pageSize);
      
      // Update cache
      this.collectionPhotos.set(cacheKey, data);
      
      return data;
    } catch (error) {
      this.setError(error);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Update user's collections cache
   * @private
   * @param {number} userId - User ID
   */
  updateUserCollectionsCache(userId) {
    // Clear all cached pages for this user
    for (const [key] of this.collectionsByUser) {
      if (key.startsWith(`${userId}-`)) {
        this.collectionsByUser.delete(key);
      }
    }
  }

  /**
   * Update collection photos cache
   * @private
   * @param {number} collectionId - Collection ID
   */
  updateCollectionPhotosCache(collectionId) {
    // Clear all cached pages for this collection
    for (const [key] of this.collectionPhotos) {
      if (key.startsWith(`${collectionId}-`)) {
        this.collectionPhotos.delete(key);
      }
    }
  }

  /**
   * Clear all data and reset state
   */
  clearData() {
    super.clearData();
    this.collectionsByUser.clear();
    this.collectionsById.clear();
    this.collectionPhotos.clear();
    this.collectionStats.clear();
    this.featuredCollections = null;
    this.trendingCollections.clear();
  }
}

// Create a singleton instance
const collectionManager = new CollectionsManager();

export { collectionManager }; 