import api from '../../config';

export const categoriesApi = {
  getAllCategories: () => api.get('/categories/'),
  getCategory: (categoryId) => api.get(`/categories/${categoryId}/`),
  createCategory: (data) => api.post('/categories/', data),
  updateCategory: (categoryId, data) => api.put(`/categories/${categoryId}/`, data),
  deleteCategory: (categoryId) => api.delete(`/categories/${categoryId}/`),
  addPhotos: (categoryId, photoIds) => api.post(`/categories/${categoryId}/add_photos/`, { photo_ids: photoIds }),
  removePhotos: (categoryId, photoIds) => api.post(`/categories/${categoryId}/remove_photos/`, { photo_ids: photoIds }),
  getCategoryPhotos: (categoryId, page = 1, pageSize = 10) => 
    api.get(`/categories/${categoryId}/photos/`, { params: { page, page_size: pageSize } }),
  getPopular: () => api.get('/categories/popular/'),
  getStats: (categoryId) => api.get(`/categories/${categoryId}/stats/`),
}; 