import { commentsService } from './service';
import { BaseManager } from '../base/BaseManager';

/**
 * CommentsManager handles comments-related operations and state management
 * Extends BaseManager for common functionality
 */
export class CommentsManager extends BaseManager {
  constructor() {
    super();
    // Initialize caches
    this.comments = new Map(); // Cache comments by ID
    this.photoComments = new Map(); // Cache comments by photo ID
    this.userComments = new Map(); // Cache comments by user ID
    this.commentStats = new Map(); // Cache comment statistics
    this.recentComments = null; // Cache recent comments
  }

  /**
   * Get comments for a photo
   * @param {number} photoId - Photo ID
   * @param {number} page - Page number (default: 1)
   * @param {number} pageSize - Number of items per page (default: 10)
   * @returns {Promise<Object>} Paginated comments data
   */
  async getPhotoComments(photoId, page = 1, pageSize = 20) {
    try {
      this.setLoading(true);
      const cacheKey = `${photoId}-${page}-${pageSize}`;
      
      if (this.photoComments.has(cacheKey)) {
        return this.photoComments.get(cacheKey);
      }

      const data = await commentsService.getPhotoComments(photoId, page, pageSize);
      this.photoComments.set(cacheKey, data);
      
      // Update individual comment cache
      data.forEach(comment => {
        this.comments.set(comment.id, comment);
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
   * Add a comment to a photo
   * @param {number} photoId - Photo ID
   * @param {string} content - Comment content
   * @returns {Promise<Object>} Created comment data
   */
  async addComment(photoId, content) {
    return this.handleOperation(async () => {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await commentsService.addComment(photoId, content);
        // Update caches
        this.updateCommentCache(photoId, response);
        return response;
      } finally {
        this.isLoading = false;
      }
    });
  }

  /**
   * Update a comment
   * @param {number} commentId - Comment ID
   * @param {string} content - Updated comment content
   * @returns {Promise<Object>} Updated comment data
   */
  async updateComment(commentId, content) {
    return this.handleOperation(async () => {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await commentsService.updateComment(commentId, content);
        // Update caches
        this.updateCommentInCache(commentId, response);
        return response;
      } finally {
        this.isLoading = false;
      }
    });
  }

  /**
   * Delete a comment
   * @param {number} commentId - Comment ID
   * @returns {Promise<void>}
   */
  async deleteComment(commentId) {
    return this.handleOperation(async () => {
      this.isLoading = true;
      this.error = null;
      try {
        await commentsService.deleteComment(commentId);
        // Remove from caches
        this.removeCommentFromCache(commentId);
      } finally {
        this.isLoading = false;
      }
    });
  }

  /**
   * Get user's comments
   * @param {number} userId - User ID
   * @param {number} page - Page number (default: 1)
   * @param {number} pageSize - Number of items per page (default: 10)
   * @returns {Promise<Object>} Paginated comments data
   */
  async getUserComments(userId, page = 1, pageSize = 10) {
    return this.handleOperation(async () => {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await commentsService.getUserComments(userId, page, pageSize);
        this.userComments.set(userId, response);
        return response;
      } finally {
        this.isLoading = false;
      }
    });
  }

  /**
   * Get comment count for a photo
   * @param {number} photoId - Photo ID
   * @returns {Promise<number>} Number of comments
   */
  async getCommentCount(photoId) {
    return this.handleOperation(async () => {
      // Check cache first
      const cachedCount = this.commentCounts.get(photoId);
      if (cachedCount !== undefined) {
        return cachedCount;
      }

      // Fetch from API if not in cache
      const count = await commentsService.getCommentCount(photoId);
      this.commentCounts.set(photoId, count);
      return count;
    });
  }

  /**
   * Report a comment
   * @param {number} commentId - Comment ID
   * @param {string} reason - Reason for reporting
   * @returns {Promise<void>}
   */
  async reportComment(commentId, reason) {
    return this.handleOperation(async () => {
      await commentsService.reportComment(commentId, reason);
    });
  }

  /**
   * Like a comment
   * @param {number} commentId - Comment ID
   * @returns {Promise<Object>} Updated comment data
   */
  async likeComment(commentId) {
    return this.handleOperation(async () => {
      const response = await commentsService.likeComment(commentId);
      this.updateCommentInCache(commentId, response);
      return response;
    });
  }

  /**
   * Unlike a comment
   * @param {number} commentId - Comment ID
   * @returns {Promise<Object>} Updated comment data
   */
  async unlikeComment(commentId) {
    return this.handleOperation(async () => {
      const response = await commentsService.unlikeComment(commentId);
      this.updateCommentInCache(commentId, response);
      return response;
    });
  }

  /**
   * Update comment cache when adding a new comment
   * @private
   * @param {number} photoId - Photo ID
   * @param {Object} comment - New comment data
   */
  updateCommentCache(photoId, comment) {
    // Update photo comments cache
    const photoComments = this.photoComments.get(photoId);
    if (photoComments) {
      photoComments.results.unshift(comment);
      photoComments.count += 1;
      this.photoComments.set(photoId, photoComments);
    }

    // Update user comments cache
    const userComments = this.userComments.get(comment.user_id);
    if (userComments) {
      userComments.results.unshift(comment);
      userComments.count += 1;
      this.userComments.set(comment.user_id, userComments);
    }

    // Update comment count cache
    const currentCount = this.commentCounts.get(photoId) || 0;
    this.commentCounts.set(photoId, currentCount + 1);
  }

  /**
   * Update a comment in all caches
   * @private
   * @param {number} commentId - Comment ID
   * @param {Object} updatedComment - Updated comment data
   */
  updateCommentInCache(commentId, updatedComment) {
    // Update in photo comments cache
    for (const [photoId, comments] of this.photoComments.entries()) {
      const index = comments.results.findIndex(c => c.id === commentId);
      if (index !== -1) {
        comments.results[index] = updatedComment;
        this.photoComments.set(photoId, comments);
      }
    }

    // Update in user comments cache
    for (const [userId, comments] of this.userComments.entries()) {
      const index = comments.results.findIndex(c => c.id === commentId);
      if (index !== -1) {
        comments.results[index] = updatedComment;
        this.userComments.set(userId, comments);
      }
    }
  }

  /**
   * Remove a comment from all caches
   * @private
   * @param {number} commentId - Comment ID
   */
  removeCommentFromCache(commentId) {
    // Remove from photo comments cache
    for (const [photoId, comments] of this.photoComments.entries()) {
      const index = comments.results.findIndex(c => c.id === commentId);
      if (index !== -1) {
        comments.results.splice(index, 1);
        comments.count -= 1;
        this.photoComments.set(photoId, comments);
      }
    }

    // Remove from user comments cache
    for (const [userId, comments] of this.userComments.entries()) {
      const index = comments.results.findIndex(c => c.id === commentId);
      if (index !== -1) {
        comments.results.splice(index, 1);
        comments.count -= 1;
        this.userComments.set(userId, comments);
      }
    }

    // Update comment count cache
    for (const [photoId, count] of this.commentCounts.entries()) {
      this.commentCounts.set(photoId, count - 1);
    }
  }

  /**
   * Get cached comments for a photo
   * @param {number} photoId - Photo ID
   * @returns {Object|null} Cached comments data
   */
  getCachedPhotoComments(photoId) {
    return this.photoComments.get(photoId) || null;
  }

  /**
   * Get cached comments for a user
   * @param {number} userId - User ID
   * @returns {Object|null} Cached comments data
   */
  getCachedUserComments(userId) {
    return this.userComments.get(userId) || null;
  }

  /**
   * Get cached comment count for a photo
   * @param {number} photoId - Photo ID
   * @returns {number|null} Cached comment count
   */
  getCachedCommentCount(photoId) {
    return this.commentCounts.get(photoId) ?? null;
  }

  /**
   * Clear all data and reset state
   */
  clearData() {
    super.clearData();
    this.comments.clear();
    this.photoComments.clear();
    this.userComments.clear();
    this.commentCounts.clear();
    this.recentComments = null;
  }

  /**
   * Get current loading state
   * @returns {boolean} Loading state
   */
  get isLoading() {
    return this._isLoading;
  }

  /**
   * Set loading state
   * @param {boolean} value - Loading state
   */
  set isLoading(value) {
    this._isLoading = value;
  }

  /**
   * Get current error state
   * @returns {Error|null} Error object or null
   */
  get error() {
    return this._error;
  }

  /**
   * Set error state
   * @param {Error|null} value - Error object or null
   */
  set error(value) {
    this._error = value;
  }
}

// Create a singleton instance
const commentsManager = new CommentsManager();

export default commentsManager; 