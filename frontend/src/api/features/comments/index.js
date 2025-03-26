import  api  from '../../config';

export const commentsApi = {
  // Get all comments
  list: (params) => 
    api.get('/comments/', { 
      params,
      timeout: 10000
    }),
  
  // Create new comment
  create: (photoId, commentText) => 
    api.post('/comments/', { 
      photo_id: photoId,
      comment_text: commentText 
    }, { timeout: 10000 }),
  
  // Get single comment
  get: (commentId) => 
    api.get(`/comments/${commentId}/`, { timeout: 10000 }),
  
  // Update comment
  update: (commentId, commentText) => 
    api.put(`/comments/${commentId}/`, { 
      comment_text: commentText 
    }, { timeout: 10000 }),
  
  // Delete comment
  delete: (commentId) => 
    api.delete(`/comments/${commentId}/`, { timeout: 10000 }),
  
  // Get photo comments
  getPhotoComments: (photoId, page = 1, pageSize = 20) => 
    api.get(`/comments/photo/${photoId}/`, { params: { page, page_size: pageSize } }),
  
  // Get user's comment history
  getUserComments: (userId) => api.get(`/comments/user/${userId}/`),
  
  // Get comment statistics for a photo
  getStats: (photoId) => api.get(`/comments/stats/${photoId}/`),
  
  // Get recent comments
  getRecent: () => api.get('/comments/recent/'),
  
  // Get user's comment statistics
  getUserStats: (userId) => api.get(`/comments/user/${userId}/stats/`),
  
  // Report a comment
  report: (commentId, reason) => 
    api.post(`/comments/${commentId}/report/`, { reason }, { timeout: 10000 }),
  
  // Like a comment
  like: (commentId) => 
    api.post(`/comments/${commentId}/like/`, {}, { timeout: 10000 }),
  
  // Unlike a comment
  unlike: (commentId) => 
    api.post(`/comments/${commentId}/unlike/`, {}, { timeout: 10000 }),

  // Create a new comment
  createComment: (data) => api.post('/comments/', data),

  // Update a comment
  updateComment: (commentId, data) => api.patch(`/comments/${commentId}/`, data),

  // Delete a comment
  deleteComment: (commentId) => api.delete(`/comments/${commentId}/`),

  // Report a comment
  reportComment: (commentId, data) => api.post(`/comments/${commentId}/report/`, data),
}; 