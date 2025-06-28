// Helper function to calculate mood statistics
const calculateMoodStats = (moodData) => {
  if (moodData.length === 0) {
    return {
      averageMood: 0,
      numberOfMoodTracking: 0,
      happyDays: 0
    };
  }

  const averageMood = moodData.reduce((sum, mood) => sum + mood, 0) / moodData.length;
  const numberOfMoodTracking = moodData.length;
  const happyDays = moodData.filter(mood => mood >= 4).length;

  return {
    averageMood: parseFloat(averageMood.toFixed(2)),
    numberOfMoodTracking,
    happyDays
  };
};

// Helper function to validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Helper function to validate age
const isValidAge = (age, min = 16, max = 60) => {
  return age >= min && age <= max;
};

// Helper function to validate date of birth
const isValidDateOfBirth = (dateOfBirth) => {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  return birthDate <= today && !isNaN(birthDate);
};

// Helper function to calculate age from date of birth
const calculateAge = (dateOfBirth) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// Helper function to format date
const formatDate = (date) => {
  if (!date) return null;
  return new Date(date).toISOString().split('T')[0];
};

// Helper function to get days between two dates
const getDaysBetween = (date1, date2) => {
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  const firstDate = new Date(date1);
  const secondDate = new Date(date2);
  
  return Math.round(Math.abs((firstDate - secondDate) / oneDay));
};

// Helper function to get recent mood logs
const getRecentMoodLogs = (moodLogs, days = 7) => {
  const recentDate = new Date();
  recentDate.setDate(recentDate.getDate() - days);
  
  return moodLogs
    .filter(log => new Date(log.date) >= recentDate)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
};

// Helper function to sanitize user input
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
};

// Helper function to generate random string (for tokens, etc.)
const generateRandomString = (length = 32) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// Helper function to validate pregnancy weeks
const isValidPregnancyWeeks = (weeks) => {
  return weeks >= 0 && weeks <= 42;
};

// Helper function to check if user is authorized for resource
const isAuthorizedUser = (user, resourceUserId, allowedRoles = []) => {
  if (allowedRoles.includes(user.role)) return true;
  return user._id.toString() === resourceUserId.toString();
};

// Helper function to create response object
const createResponse = (success = true, message = '', data = null, error = null) => {
  return {
    success,
    message,
    data,
    error,
    timestamp: new Date().toISOString()
  };
};

module.exports = {
  calculateMoodStats,
  isValidEmail,
  isValidAge,
  isValidDateOfBirth,
  calculateAge,
  formatDate,
  getDaysBetween,
  getRecentMoodLogs,
  sanitizeInput,
  generateRandomString,
  isValidPregnancyWeeks,
  isAuthorizedUser,
  createResponse
};