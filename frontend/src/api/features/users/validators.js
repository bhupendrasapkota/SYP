/**
 * User profile validation utilities
 */

export const validateFullName = (fullName) => {
  if (!fullName?.trim()) {
    return "Full name is required";
  }
  if (fullName.length > 100) {
    return "Full name must be less than 100 characters";
  }
  return null;
};

export const validateUsername = (username) => {
  if (!username?.trim()) {
    return "Username is required";
  }
  if (username.length > 50) {
    return "Username must be less than 50 characters";
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return "Username can only contain letters, numbers, and underscores";
  }
  return null;
};

export const validateEmail = (email) => {
  if (!email?.trim()) {
    return "Email is required";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Please enter a valid email address";
  }
  return null;
};

export const validateBio = (bio) => {
  if (bio?.length > 500) {
    return "Bio must be less than 500 characters";
  }
  return null;
};

export const validateContact = (contact) => {
  if (contact && !/^\+?[\d\s-()]+$/.test(contact)) {
    return "Please enter a valid contact number";
  }
  return null;
};

export const validateAbout = (about) => {
  if (about?.length > 1000) {
    return "About section must be less than 1000 characters";
  }
  return null;
};

export const validateProfilePicture = (file) => {
  if (!file) return null;
  
  if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
    return "Please upload a valid image file (JPG, JPEG, or PNG)";
  }
  
  if (file.size > 5 * 1024 * 1024) {
    return "Image size should be less than 5MB";
  }
  
  return null;
};

export const validateProfileForm = (formData) => {
  const errors = {};
  
  const fullNameError = validateFullName(formData.full_name);
  if (fullNameError) errors.full_name = fullNameError;
  
  const usernameError = validateUsername(formData.username);
  if (usernameError) errors.username = usernameError;
  
  const emailError = validateEmail(formData.email);
  if (emailError) errors.email = emailError;
  
  const bioError = validateBio(formData.bio);
  if (bioError) errors.bio = bioError;
  
  const contactError = validateContact(formData.contact);
  if (contactError) errors.contact = contactError;
  
  const aboutError = validateAbout(formData.about);
  if (aboutError) errors.about = aboutError;
  
  return {
    errors,
    isValid: Object.keys(errors).length === 0
  };
}; 