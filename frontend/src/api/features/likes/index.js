import api from '../../config';

export const likesApi = {
  // Toggle like status for a photo
  toggleLike: (photoId) => api.post('/likes/toggle_like/', { photo_id: photoId }),

  // Get photo's likes
  getPhotoLikes: (photoId) => api.get('/likes/photo_likes/', { params: { photo_id: photoId } }),

  // Get user's liked photos
  getUserLikes: (username) => api.get('/likes/user_likes/', { params: { username } }),

  // Get recent likes
  getRecent: () => api.get('/likes/recent/'),

  // Get like statistics for a photo
  getStats: (photoId) => api.get('/likes/stats/', { params: { photo_id: photoId } }),

  // Get user's like statistics
  getUserStats: (username) => api.get('/likes/user_stats/', { params: { username } }),

  // Check if current user likes a specific photo
  checkLike: (photoId) => api.get('/likes/check_like/', { params: { photo_id: photoId } })
}; 