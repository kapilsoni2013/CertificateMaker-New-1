/**
 * Generate a unique ID
 * @returns {string} A unique ID
 */
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Format a date string
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

/**
 * Calculate total marks and percentage
 * @param {Array} subjects - Array of subject objects with marks
 * @returns {Object} Object containing total marks and percentage
 */
export const calculateResults = (subjects) => {
  if (!subjects || subjects.length === 0) {
    return { total: 0, percentage: 0 };
  }
  
  const total = subjects.reduce((sum, subject) => sum + subject.marks, 0);
  const percentage = (total / (subjects.length * 100)) * 100;
  
  return {
    total,
    percentage: Math.round(percentage * 100) / 100
  };
};

/**
 * Validate image file
 * @param {File} file - File object
 * @returns {Object} Object with isValid flag and error message
 */
export const validateImageFile = (file) => {
  if (!file) {
    return { isValid: false, error: 'No file selected' };
  }
  
  // Check if file is an image
  if (!file.type.match('image.*')) {
    return { isValid: false, error: 'Please select an image file (PNG or JPG)' };
  }
  
  // Check file size (limit to 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return { isValid: false, error: 'File size should be less than 5MB' };
  }
  
  return { isValid: true, error: null };
};

/**
 * Convert file to base64
 * @param {File} file - File object
 * @returns {Promise} Promise that resolves with base64 string
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

/**
 * Get field value from student data
 * @param {Object} student - Student object
 * @param {string} fieldName - Field name to retrieve
 * @returns {string|number} Field value
 */
export const getStudentField = (student, fieldName) => {
  const normalizedField = fieldName.toLowerCase();
  
  // Check for direct properties
  if (normalizedField === 'name') return student.name;
  if (normalizedField === 'roll_number') return student.rollNumber;
  if (normalizedField === 'class') return student.class;
  
  // Check for subject marks
  if (normalizedField.endsWith('_marks') && student.subjects) {
    const subjectName = normalizedField.replace('_marks', '').replace(/_/g, ' ');
    const subject = student.subjects.find(
      s => s.name.toLowerCase() === subjectName
    );
    return subject ? subject.marks : '';
  }
  
  // Check for calculated fields
  if (normalizedField === 'total_marks' && student.subjects) {
    return calculateResults(student.subjects).total;
  }
  
  if (normalizedField === 'percentage' && student.subjects) {
    return calculateResults(student.subjects).percentage + '%';
  }
  
  return '';
};