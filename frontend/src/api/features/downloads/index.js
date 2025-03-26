import api from '../../config';

export const downloadsApi = {
  // Track a photo download
  trackDownload: (photoId) => api.post('/downloads/track_download/', { photo_id: photoId }),

  // Get user's download history
  getHistory: (userId) => api.get('/downloads/history/', { params: { user_id: userId } }),

  // Get download statistics
  getStats: (userId) => api.get('/downloads/stats/', { params: { user_id: userId } }),

  // Get most downloaded photos
  getMostDownloaded: () => api.get('/downloads/most_downloaded/'),

  // Check download limits
  checkLimits: () => api.get('/downloads/check_limits/'),

  // Remove download by photo ID
  removeByPhoto: (photoId) => api.delete('/downloads/remove_by_photo/', { data: { photo_id: photoId } })
}; 