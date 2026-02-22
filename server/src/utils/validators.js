export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  export const isValidPhone = (phone) => {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
  };
  
  export const isValidZipCode = (zipCode) => {
    return /^\d{5}(-\d{4})?$/.test(zipCode);
  };
  
  export const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };
  
  export const isValidMongoId = (id) => {
    return /^[0-9a-fA-F]{24}$/.test(id);
  };
  
  export const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    return input.trim().replace(/<script[^>]*>.*?<\/script>/gi, '');
  };
  
  export const isStrongPassword = (password) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
  };
  
  export default {
    isValidEmail,
    isValidPhone,
    isValidZipCode,
    isValidUrl,
    isValidMongoId,
    sanitizeInput,
    isStrongPassword
  };