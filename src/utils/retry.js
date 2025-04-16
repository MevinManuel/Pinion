// src/utils/retry.js

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxAttempts - Maximum number of retry attempts
 * @param {number} baseDelay - Base delay in milliseconds between retries
 * @returns {Promise} - Returns the result of the function
 */
export const retry = async (fn, maxAttempts = 3, baseDelay = 1000) => {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxAttempts) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt - 1);
      
      // Add some randomness to prevent thundering herd
      const jitter = Math.random() * 1000;
      
      // Wait before next attempt
      await new Promise(resolve => setTimeout(resolve, delay + jitter));
    }
  }

  throw lastError;
};