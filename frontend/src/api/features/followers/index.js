import api from '../../config';

export const followersApi = {
  // Toggle follow status for a user
  toggleFollow: (username) => api.post('/followers/toggle_follow/', { username }),

  // Get user's followers
  getFollowers: (username) => api.get('/followers/followers/', { params: { username } }),

  // Get users that a user is following
  getFollowing: (username) => api.get('/followers/following/', { params: { username } }),

  // Get follower statistics
  getStats: (username) => api.get('/followers/stats/', { params: { username } }),

  // Check if current user follows a specific user
  checkFollow: (username) => api.get('/followers/check_follow/', { params: { username } }),

  // Get suggested users to follow
  getSuggestedUsers: () => api.get('/followers/suggest_users/')
}; 