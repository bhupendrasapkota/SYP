import { likesService } from './service';
import { BaseManager } from '../base/BaseManager';

/**
 * LikesManager handles likes-related operations and state management
 * Extends BaseManager for common functionality
 */
export class LikesManager extends BaseManager {
  constructor() {
    super();
    // Initialize caches
    this.photoLikes = new Map(); // Cache likes by photo ID
    this.userLikes = new Map(); // Cache likes by username
    this.likeStats = new Map(); // Cache like statistics by photo ID
    this.userLikeStats = new Map(); // Cache user like statistics by username
    this.likeStatus = new Map(); // Cache like status by photo ID
    this.recentLikes = null; // Cache recent likes
  }

  /**
   * Toggle like status for a photo
   * @param {string} photoId - ID of the photo to like/unlike
   * @returns {Promise<Object>} Like status and message
   */
  async toggleLike(photoId) {
    try {
      this.setLoading(true);
      const data = await likesService.toggleLike(photoId);
      
      // Update caches
      this.likeStatus.set(photoId, data.liked);
      this.updatePhotoLikesCache(photoId);
      this.updateLikeStatsCache(photoId);
      this.recentLikes = null; // Clear recent likes cache
      
      return data;
    } catch (error) {
      this.setError(error);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Get photo's likes
   * @param {string} photoId - ID of the photo to get likes for
   * @returns {Promise<Array<Object>>} Array of likes
   */
  async getPhotoLikes(photoId) {
    try {
      this.setLoading(true);
      
      if (this.photoLikes.has(photoId)) {
        return this.photoLikes.get(photoId);
      }

      const data = await likesService.getPhotoLikes(photoId);
      this.photoLikes.set(photoId, data);
      
      return data;
    } catch (error) {
      this.setError(error);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Get user's liked photos
   * @param {string} username - Username to get liked photos for
   * @returns {Promise<Array<Object>>} Array of liked photos
   */
  async getUserLikes(username) {
    try {
      this.setLoading(true);
      
      if (this.userLikes.has(username)) {
        return this.userLikes.get(username);
      }

      const data = await likesService.getUserLikes(username);
      this.userLikes.set(username, data);
      
      return data;
    } catch (error) {
      this.setError(error);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Get recent likes
   * @returns {Promise<Array<Object>>} Array of recent likes
   */
  async getRecent() {
    try {
      this.setLoading(true);
      
      if (this.recentLikes) {
        return this.recentLikes;
      }

      const data = await likesService.getRecent();
      this.recentLikes = data;
      
      return data;
    } catch (error) {
      this.setError(error);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Get like statistics for a photo
   * @param {string} photoId - ID of the photo to get stats for
   * @returns {Promise<Object>} Like statistics
   */
  async getStats(photoId) {
    try {
      this.setLoading(true);
      
      if (this.likeStats.has(photoId)) {
        return this.likeStats.get(photoId);
      }

      const data = await likesService.getStats(photoId);
      this.likeStats.set(photoId, data);
      
      return data;
    } catch (error) {
      this.setError(error);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Get user's like statistics
   * @param {string} username - Username to get stats for
   * @returns {Promise<Object>} User's like statistics
   */
  async getUserStats(username) {
    try {
      this.setLoading(true);
      
      if (this.userLikeStats.has(username)) {
        return this.userLikeStats.get(username);
      }

      const data = await likesService.getUserStats(username);
      this.userLikeStats.set(username, data);
      
      return data;
    } catch (error) {
      this.setError(error);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Check if current user likes a specific photo
   * @param {string} photoId - ID of the photo to check like status for
   * @returns {Promise<boolean>} Whether the photo is liked
   */
  async checkLike(photoId) {
    try {
      this.setLoading(true);
      
      if (this.likeStatus.has(photoId)) {
        return this.likeStatus.get(photoId);
      }

      const isLiked = await likesService.checkLike(photoId);
      this.likeStatus.set(photoId, isLiked);
      
      return isLiked;
    } catch (error) {
      this.setError(error);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Update photo likes cache
   * @private
   * @param {string} photoId - Photo ID
   */
  updatePhotoLikesCache(photoId) {
    this.photoLikes.delete(photoId);
  }

  /**
   * Update like statistics cache
   * @private
   * @param {string} photoId - Photo ID
   */
  updateLikeStatsCache(photoId) {
    this.likeStats.delete(photoId);
  }

  /**
   * Clear all data and reset state
   */
  clearData() {
    super.clearData();
    this.photoLikes.clear();
    this.userLikes.clear();
    this.likeStats.clear();
    this.userLikeStats.clear();
    this.likeStatus.clear();
    this.recentLikes = null;
  }
}

// Create a singleton instance
const likesManager = new LikesManager();
export default likesManager; 