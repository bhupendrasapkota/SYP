import api from '../../config';

export const usersApi = {
  // Get user profile
  getUserProfile: (username) => api.get(`/users/${username}/`),

  // Update user profile
  updateProfile: (data) => api.patch('/users/me/', data),

  // Change password
  changePassword: (data) => api.post('/users/change-password/', data),

  // Get user statistics
  getUserStats: (username) => api.get(`/users/${username}/stats/`),

  // Get user's followers
  getFollowers: (username, params = {}) => api.get(`/users/${username}/followers/`, { params }),

  // Get user's following
  getFollowing: (username, params = {}) => api.get(`/users/${username}/following/`, { params }),

  // Get suggested users
  getSuggestedUsers: (params = {}) => api.get('/users/suggested/', { params }),

  // Search users
  searchUsers: (query, params = {}) => api.get('/users/search/', { 
    params: { query, ...params }
  }),

  // Get user's notifications
  getNotifications: (params = {}) => api.get('/users/notifications/', { params }),

  // Mark notifications as read
  markNotificationsRead: (notificationIds) => api.post('/users/notifications/read/', { notification_ids: notificationIds }),

  // Delete account
  deleteAccount: () => api.delete('/users/me/'),

  // Get user by ID
  getUserById: (userId) => api.get(`/users/profile/${userId}/`),

  // Update user profile
  updateProfile: async (formData) => {
    try {
      const fileData = new FormData();
      const textData = {};

      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          fileData.append(key, value);
        } else {
          textData[key] = value;
        }
      }

      for (const [key, value] of Object.entries(textData)) {
        fileData.append(key, value);
      }

      const response = await api.patch("/users/profile/", fileData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  }
}; 