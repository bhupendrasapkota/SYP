/**
 * Retries a failed request up to 3 times
 * @param {Function} requestFn - The function that makes the API request
 * @returns {Promise} - The result of the request
 */
export const retryRequest = async (requestFn) => {
  const maxRetries = 3;
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      
      // Don't retry if we've hit max retries or if it's not a server error
      if (attempt === maxRetries || error.response?.status < 500) {
        throw error;
      }
      
      // Wait 1 second before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  throw lastError;
}; 