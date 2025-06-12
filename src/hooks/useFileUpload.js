import { useState } from 'react';
import { validateImageFile, fileToBase64 } from '../utils/helpers';

/**
 * Custom hook for handling file uploads
 * @returns {Object} File upload state and handlers
 */
const useFileUpload = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handle file selection
   * @param {File} selectedFile - Selected file object
   */
  const handleFileSelect = async (selectedFile) => {
    if (!selectedFile) {
      setFile(null);
      setPreview('');
      setError('');
      return;
    }

    const validation = validateImageFile(selectedFile);
    
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }

    setError('');
    setFile(selectedFile);
    setIsLoading(true);

    try {
      const base64 = await fileToBase64(selectedFile);
      setPreview(base64);
    } catch (err) {
      setError('Failed to generate preview');
      console.error('Preview generation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Clear selected file
   */
  const clearFile = () => {
    setFile(null);
    setPreview('');
    setError('');
  };

  return {
    file,
    preview,
    error,
    isLoading,
    handleFileSelect,
    clearFile
  };
};

export default useFileUpload;