import { downloadsService } from './service';
import { BaseManager } from '../base/BaseManager';

/**
 * DownloadsManager handles downloads-related operations and state management
 * Extends BaseManager for common functionality
 */
export class DownloadsManager extends BaseManager {
  constructor() {
    super();
    // Initialize caches
    this.downloads = new Map(); // Cache downloads by ID
    this.userDownloads = new Map(); // Cache downloads by user ID
    this.downloadStats = new Map(); // Cache download statistics
    this.mostDownloaded = null; // Cache most downloaded photos
    this.downloadLimits = null; // Cache download limits
  }

  /**
   * Track a photo download
   * @param {string} photoId - Photo ID
   * @returns {Promise<Object>} Download data
   */
  async trackDownload(photoId) {
    try {
      this.setLoading(true);
      const data = await downloadsService.trackDownload(photoId);
      
      // Update caches
      this.downloads.set(data.id, data);
      this.updateUserDownloadsCache(data.user.id);
      this.updateDownloadStats(data.user.id);
      this.mostDownloaded = null; // Clear most downloaded cache
      this.downloadLimits = null; // Clear limits cache
      
      return data;
    } catch (error) {
      this.setError(error);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Get user's download history
   * @param {string} userId - User ID (optional, defaults to current user)
   * @returns {Promise<Array<Object>>} Array of downloads
   */
  async getHistory(userId) {
    try {
      this.setLoading(true);
      
      if (this.userDownloads.has(userId)) {
        return this.userDownloads.get(userId);
      }

      const data = await downloadsService.getHistory(userId);
      this.userDownloads.set(userId, data);
      
      // Update individual download cache
      data.forEach(download => {
        this.downloads.set(download.id, download);
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
   * Get download statistics
   * @param {string} userId - User ID (optional, defaults to current user)
   * @returns {Promise<Object>} Download statistics
   */
  async getStats(userId) {
    try {
      this.setLoading(true);
      
      if (this.downloadStats.has(userId)) {
        return this.downloadStats.get(userId);
      }

      const data = await downloadsService.getStats(userId);
      this.downloadStats.set(userId, data);
      
      return data;
    } catch (error) {
      this.setError(error);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Get most downloaded photos
   * @returns {Promise<Array<Object>>} Array of most downloaded photos
   */
  async getMostDownloaded() {
    try {
      this.setLoading(true);
      
      if (this.mostDownloaded) {
        return this.mostDownloaded;
      }

      const data = await downloadsService.getMostDownloaded();
      this.mostDownloaded = data;
      
      return data;
    } catch (error) {
      this.setError(error);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Check download limits
   * @returns {Promise<Object>} Download limits and usage
   */
  async checkLimits() {
    try {
      this.setLoading(true);
      
      if (this.downloadLimits) {
        return this.downloadLimits;
      }

      const data = await downloadsService.checkLimits();
      this.downloadLimits = data;
      
      return data;
    } catch (error) {
      this.setError(error);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Remove download by photo ID
   * @param {string} photoId - Photo ID
   * @returns {Promise<void>}
   */
  async removeByPhoto(photoId) {
    try {
      this.setLoading(true);
      await downloadsService.removeByPhoto(photoId);
      
      // Clear relevant caches
      this.updateUserDownloadsCache();
      this.updateDownloadStats();
      this.mostDownloaded = null;
      this.downloadLimits = null;
    } catch (error) {
      this.setError(error);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Update user downloads cache
   * @private
   * @param {string} userId - User ID
   */
  updateUserDownloadsCache(userId) {
    this.userDownloads.delete(userId);
  }

  /**
   * Update download statistics cache
   * @private
   * @param {string} userId - User ID
   */
  updateDownloadStats(userId) {
    this.downloadStats.delete(userId);
  }

  /**
   * Clear all data and reset state
   */
  clearData() {
    super.clearData();
    this.downloads.clear();
    this.userDownloads.clear();
    this.downloadStats.clear();
    this.mostDownloaded = null;
    this.downloadLimits = null;
  }
}

// Create a singleton instance
const downloadsManager = new DownloadsManager();
export { downloadsManager };
export default downloadsManager; 