/**
 * Validates password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with strength and details
 */
export const validatePassword = (password) => {
  let strength = 0;
  const details = [];

  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  return { strength, details };
};

/**
 * Validates registration form data
 * @param {Object} formData - Form data to validate
 * @returns {Object} Validation result with isValid flag and errors array
 */
export const validateRegistrationForm = (formData) => {
  const errors = [];

  if (!formData.username || formData.username.length < 3) {
    errors.push('Username must be at least 3 characters long');
  }

  if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.push('Please enter a valid email address');
  }

  if (!formData.password || formData.password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (formData.password !== formData.confirmPassword) {
    errors.push('Passwords do not match');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Gets text description of password strength
 * @param {number} strength - Password strength score (0-5)
 * @returns {string} Description of password strength
 */
export const getPasswordStrengthText = (strength) => {
  const texts = ['Very Weak', 'Weak', 'Medium', 'Strong', 'Very Strong'];
  return texts[Math.min(strength - 1, texts.length - 1)] || 'Very Weak';
};

/**
 * Gets color class for password strength indicator
 * @param {number} strength - Password strength score (0-5)
 * @returns {string} Tailwind color class
 */
export const getPasswordStrengthColor = (strength) => {
  const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-green-600'];
  return colors[Math.min(strength - 1, colors.length - 1)] || 'bg-red-500';
}; 