/**
 * Custom API error class
 */
export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Handles API errors and transforms them into a consistent format
 * @param {Error} error - The error to handle
 * @throws {ApiError} Transformed error
 */
export const handleApiError = (error) => {
  if (error instanceof ApiError) {
    throw error;
  }

  const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
  const status = error.response?.status || 500;
  const data = error.response?.data;

  throw new ApiError(message, status, data);
}; 