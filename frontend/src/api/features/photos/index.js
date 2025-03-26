import api from '../../config';

export const photosApi = {
  // Get all photos with optional filters
  getAllPhotos: (params = {}) => 
    api.get('/photos/', { 
      params: {
        page: params.page || 1,
        page_size: params.pageSize || 10,
        time_period: params.timePeriod,
        user__username: params.username,
        upload_date__gte: params.startDate,
        upload_date__lte: params.endDate,
        likes_count__gte: params.minLikes,
        likes_count__lte: params.maxLikes,
        search: params.search,
        ordering: params.ordering,
        include_user_photos: true
      },
      timeout: 10000
    }),

  // Get a single photo
  getPhoto: (photoId) => 
    api.get(`/photos/${photoId}/`, { timeout: 10000 }),

  // Create a new photo
  createPhoto: (data) => 
    api.post('/photos/', data, { timeout: 10000 }),

  // Update a photo
  updatePhoto: (photoId, data) => 
    api.patch(`/photos/${photoId}/`, data, { timeout: 10000 }),

  // Delete a photo
  deletePhoto: (photoId) => 
    api.delete(`/photos/${photoId}/`, { timeout: 10000 }),

  // Upload photos (supports multiple photos)
  uploadPhotos: (formData) => 
    api.post('/photos/', formData, { 
      headers: { 
        'Content-Type': 'multipart/form-data',
        'Accept': 'application/json'
      },
      timeout: 30000
    }),

  // Get trending photos
  getTrendingPhotos: (days = 7) => 
    api.get('/photos/trending/', { 
      params: { days },
      timeout: 10000
    }),

  // Get user's gallery
  getUserGallery: (userId, page = 1, pageSize = 10, ordering = '-upload_date') => 
    api.get('/photos/user_gallery/', { 
      params: {
        user_id: userId,
        page,
        page_size: pageSize,
        ordering
      },
      timeout: 10000,
      validateStatus: function (status) {
        return status >= 200 && status < 500; // Don't reject if status is 4xx to handle errors gracefully
      }
    }),

  // Download a photo
  downloadPhoto: (photoId) => 
    api.post(`/photos/${photoId}/download/`, {}, { timeout: 10000 }),

  // Search photos
  searchPhotos: (query, params = {}) => 
    api.get('/photos/', { 
      params: {
        search: query,
        page: params.page || 1,
        page_size: params.pageSize || 10,
        ordering: params.ordering
      },
      timeout: 10000
    }),

  // Upload a new photo
  uploadPhoto: (formData) => api.post('/photos/upload/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),

  // Get user's photos
  getUserPhotos: (username, params = {}) => api.get(`/photos/user/${username}/`, { params }),

  // Get feed photos
  getFeed: (params = {}) => api.get('/photos/feed/', { params }),

  // Get featured photos
  getFeatured: (params = {}) => api.get('/photos/featured/', { params }),

  // Get photo statistics
  getStats: (photoId) => api.get(`/photos/${photoId}/stats/`),

  // Report a photo
  reportPhoto: (photoId, reason) => api.post(`/photos/${photoId}/report/`, { reason })
};