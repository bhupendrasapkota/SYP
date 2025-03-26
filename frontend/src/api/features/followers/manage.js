import { followersService } from './service';
import { BaseManager } from '../base/BaseManager';

/**
 * FollowersManager handles followers-related operations and state management
 * Extends BaseManager for common functionality
 */
export class FollowersManager extends BaseManager {
  constructor() {
    super();
    // Initialize caches
    this.followers = new Map(); // Cache followers by username
    this.following = new Map(); // Cache following by username
    this.followerStats = new Map(); // Cache follower statistics
    this.followStatus = new Map(); // Cache follow status
    this.suggestedUsers = null; // Cache suggested users
  }

  /**
   * Toggle follow status for a user
   * @param {string} username - Username to follow/unfollow
   * @returns {Promise<Object>} Follow status and message
   */
  async toggleFollow(username) {
    try {
      this.setLoading(true);
      const data = await followersService.toggleFollow(username);
      
      // Update caches
      this.followStatus.set(username, data.following);
      this.updateFollowersCache(username);
      this.updateFollowingCache();
      this.updateFollowerStats(username);
      this.suggestedUsers = null; // Clear suggested users cache
      
      return data;
    } catch (error) {
      this.setError(error);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Get user's followers
   * @param {string} username - Username to get followers for
   * @returns {Promise<Array<Object>>} Array of followers
   */
  async getFollowers(username) {
    try {
      this.setLoading(true);
      
      if (this.followers.has(username)) {
        return this.followers.get(username);
      }

      const data = await followersService.getFollowers(username);
      this.followers.set(username, data);
      
      return data;
    } catch (error) {
      this.setError(error);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Get users that a user is following
   * @param {string} username - Username to get following for
   * @returns {Promise<Array<Object>>} Array of following users
   */
  async getFollowing(username) {
    try {
      this.setLoading(true);
      
      if (this.following.has(username)) {
        return this.following.get(username);
      }

      const data = await followersService.getFollowing(username);
      this.following.set(username, data);
      
      return data;
    } catch (error) {
      this.setError(error);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Get follower statistics
   * @param {string} username - Username to get stats for
   * @returns {Promise<Object>} Follower statistics
   */
  async getStats(username) {
    try {
      this.setLoading(true);
      
      if (this.followerStats.has(username)) {
        return this.followerStats.get(username);
      }

      const data = await followersService.getStats(username);
      this.followerStats.set(username, data);
      
      return data;
    } catch (error) {
      this.setError(error);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Check if current user follows a specific user
   * @param {string} username - Username to check follow status for
   * @returns {Promise<boolean>} Whether the user is being followed
   */
  async checkFollow(username) {
    try {
      this.setLoading(true);
      
      if (this.followStatus.has(username)) {
        return this.followStatus.get(username);
      }

      const isFollowing = await followersService.checkFollow(username);
      this.followStatus.set(username, isFollowing);
      
      return isFollowing;
    } catch (error) {
      this.setError(error);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Get suggested users to follow
   * @returns {Promise<Array<Object>>} Array of suggested users
   */
  async getSuggestedUsers() {
    try {
      this.setLoading(true);
      
      if (this.suggestedUsers) {
        return this.suggestedUsers;
      }

      const data = await followersService.getSuggestedUsers();
      this.suggestedUsers = data;
      
      return data;
    } catch (error) {
      this.setError(error);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Update followers cache
   * @private
   * @param {string} username - Username
   */
  updateFollowersCache(username) {
    this.followers.delete(username);
  }

  /**
   * Update following cache
   * @private
   */
  updateFollowingCache() {
    this.following.clear();
  }

  /**
   * Update follower statistics cache
   * @private
   * @param {string} username - Username
   */
  updateFollowerStats(username) {
    this.followerStats.delete(username);
  }

  /**
   * Clear all data and reset state
   */
  clearData() {
    super.clearData();
    this.followers.clear();
    this.following.clear();
    this.followerStats.clear();
    this.followStatus.clear();
    this.suggestedUsers = null;
  }
}

// Create a singleton instance
const followersManager = new FollowersManager();
export default followersManager; 