import React, { useState, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import { v4 as uuidv4 } from 'uuid';

const TemplateUploader = ({ onSuccess, onCancel }) => {
  const { addCertificateTemplate } = useAppContext();
  
  const [templateName, setTemplateName] = useState('');
  const [templateImage, setTemplateImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState({});
  
  const fileInputRef = useRef(null);
  
  // Handle drag events
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };
  
  // Handle file selection
  const handleFileSelect = (file) => {
    // Check if file is an image
    if (!file.type.match('image.*')) {
      setErrors({ file: 'Please select an image file (PNG, JPG)' });
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ file: 'File size should be less than 5MB' });
      return;
    }
    
    setTemplateImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setErrors({});
  };
  
  // Handle file input change
  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = {};
    
    if (!templateName.trim()) {
      newErrors.name = 'Template name is required';
    }
    
    if (!templateImage) {
      newErrors.file = 'Please select an image file';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Convert image to base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Image = event.target.result;
      
      // Create new certificate template
      const newTemplate = {
        id: uuidv4(),
        name: templateName,
        imageData: base64Image,
        regions: [],
        createdAt: new Date().toISOString()
      };
      
      addCertificateTemplate(newTemplate);
      onSuccess();
    };
    
    reader.readAsDataURL(templateImage);
  };
  
  return (
    <div className="template-uploader">
      <h3>Upload Certificate Template</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="form-control">
          <label htmlFor="templateName">Template Name</label>
          <input
            type="text"
            id="templateName"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="Enter template name"
          />
          {errors.name && <div className="error">{errors.name}</div>}
        </div>
        
        <div className="form-control">
          <label>Template Image</label>
          <div
            className={`upload-area ${isDragging ? 'active' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current.click()}
          >
            <p>Drag and drop an image here, or click to select a file</p>
            <p><small>Supported formats: PNG, JPG (Max size: 5MB)</small></p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              accept="image/png, image/jpeg"
            />
          </div>
          {errors.file && <div className="error">{errors.file}</div>}
        </div>
        
        {previewUrl && (
          <div className="template-preview">
            <h4>Preview</h4>
            <img src={previewUrl} alt="Template Preview" />
          </div>
        )}
        
        <div className="form-actions">
          <button type="submit" className="btn btn-success">
            Upload Template
          </button>
          <button type="button" className="btn" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default TemplateUploader;