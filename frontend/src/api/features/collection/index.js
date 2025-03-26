import api from '../../config';

export const collectionsApi = {
  // Get user's collections
  getUserCollections: (userId, page = 1, pageSize = 10) => 
    api.get('/collections/collections/user_collections/', { 
      params: { user_id: userId, page, page_size: pageSize }
    }),
  
  // Get a single collection
  getCollection: (id) => api.get(`/collections/collections/${id}/`),
  
  // Create a new collection
  createCollection: (data) => api.post('/collections/collections/', data),
  
  // Update a collection
  updateCollection: (id, data) => api.put(`/collections/collections/${id}/`, data),
  
  // Delete a collection
  deleteCollection: (id) => api.delete(`/collections/collections/${id}/`),
  
  // Add photos to collection
  addPhotos: (collectionId, photoIds) => 
    api.post(`/collections/collections/${collectionId}/add_photos/`, { photo_ids: photoIds }),
  
  // Remove photos from collection
  removePhotos: (collectionId, photoIds) => 
    api.post(`/collections/collections/${collectionId}/remove_photos/`, { photo_ids: photoIds }),
  
  // Toggle like on collection
  toggleLike: (collectionId) => 
    api.post(`/collections/collections/${collectionId}/toggle_like/`),
  
  // Toggle follow on collection
  toggleFollow: (collectionId) => 
    api.post(`/collections/collections/${collectionId}/toggle_follow/`),
  
  // Get featured collections
  getFeatured: () => api.get('/collections/collections/featured/'),
  
  // Get trending collections
  getTrending: (days = 7) => 
    api.get('/collections/collections/trending/', { 
      params: { days }
    }),
  
  // Get collection statistics
  getStats: (id) => api.get(`/collections/collections/${id}/stats/`),

  // Get collection photos
  getCollectionPhotos: (collectionId, page = 1, pageSize = 10) => 
    api.get(`/collections/photo-collections/`, { 
      params: { collection: collectionId, page, page_size: pageSize }
    })
}; 