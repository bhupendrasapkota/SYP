import { authService } from './service';
import { BaseManager } from '../base/BaseManager';

class AuthManager extends BaseManager {
  constructor() {
    super();
    this.isAuthenticated = false;
  }

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Success message
   */
  async register(userData) {
    return this.handleOperation(async () => {
      return await authService.register(userData);
    });
  }

  /**
   * Login user
   * @param {Object} credentials - Login credentials (email and password)
   * @returns {Promise<Object>} Access and refresh tokens
   */
  async login(credentials) {
    return this.handleOperation(async () => {
      const response = await authService.login(credentials);
      this.setAuthState(true);
      return response;
    });
  }

  /**
   * Logout user
   * @param {string} refreshToken - Refresh token to blacklist
   * @returns {Promise<Object>} Success message
   */
  async logout(refreshToken) {
    return this.handleOperation(async () => {
      const response = await authService.logout(refreshToken);
      this.setAuthState(false);
      return response;
    });
  }

  /**
   * Set authentication state and emit event
   * @param {boolean} state - New auth state
   * @private
   */
  setAuthState(state) {
    if (this.isAuthenticated !== state) {
      this.isAuthenticated = state;
      this.emit('authStateChanged', state);
    }
  }

  /**
   * Get authentication state
   * @returns {boolean} Authentication status
   */
  getAuthState() {
    return this.isAuthenticated;
  }

  /**
   * Clear all data
   */
  clearData() {
    super.clearData();
    this.setAuthState(false);
  }
}

// Create a singleton instance
const authManager = new AuthManager();

export { authManager }; 