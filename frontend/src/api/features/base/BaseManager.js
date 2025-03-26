/**
 * Base Manager Class
 * Provides common functionality for all feature managers
 */
class BaseManager {
  constructor() {
    this.isLoading = false;
    this.error = null;
    this.eventListeners = new Map();
  }

  /**
   * Sets loading state
   * @param {boolean} state - Loading state
   */
  setLoading(state) {
    this.isLoading = state;
  }

  /**
   * Sets error state
   * @param {string|null} error - Error message
   */
  setError(error) {
    this.error = error;
  }

  /**
   * Subscribe to an event
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event).add(callback);
  }

  /**
   * Unsubscribe from an event
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  off(event, callback) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).delete(callback);
    }
  }

  /**
   * Emit an event
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Wraps an async operation with loading and error handling
   * @param {Function} operation - Async operation to execute
   * @returns {Promise} - Result of the operation
   */
  async handleOperation(operation) {
    this.setLoading(true);
    this.setError(null);

    try {
      const result = await operation();
      return result;
    } catch (error) {
      this.setError(error.message);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Gets loading state
   * @returns {boolean} - Current loading state
   */
  getLoadingState() {
    return this.isLoading;
  }

  /**
   * Gets error state
   * @returns {string|null} - Current error message
   */
  getError() {
    return this.error;
  }

  /**
   * Clears all data
   */
  clearData() {
    this.error = null;
    this.eventListeners.clear();
  }
}

export { BaseManager }; 