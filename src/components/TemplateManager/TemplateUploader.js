import React, { useState, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import './TemplateUploader.css';

const TemplateUploader = ({ onClose }) => {
  const { addTemplate } = useAppContext();
  const [templateName, setTemplateName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  const handleNameChange = (e) => {
    setTemplateName(e.target.value);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  const handleFile = (file) => {
    if (file) {
      // Check if file is an image
      if (!file.type.match('image.*')) {
        setErrors({ file: 'Please select an image file (PNG or JPG)' });
        return;
      }

      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ file: 'File size should be less than 5MB' });
        return;
      }

      setSelectedFile(file);
      setErrors({});

      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

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
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current.click();
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!templateName.trim()) {
      newErrors.name = 'Template name is required';
    }
    
    if (!selectedFile) {
      newErrors.file = 'Please select a template image';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Convert image to base64 for storage
      const reader = new FileReader();
      reader.onload = () => {
        const template = {
          name: templateName,
          imageData: reader.result,
          regions: [],
          createdAt: new Date().toISOString()
        };
        
        addTemplate(template);
        onClose();
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  return (
    <div className="template-uploader card">
      <h3>Upload Certificate Template</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="templateName" className="form-label">Template Name</label>
          <input
            type="text"
            id="templateName"
            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
            value={templateName}
            onChange={handleNameChange}
            placeholder="Enter template name"
          />
          {errors.name && <div className="error-message">{errors.name}</div>}
        </div>
        
        <div 
          className={`file-drop-area ${isDragging ? 'dragging' : ''} ${errors.file ? 'is-invalid' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="file-input"
            accept="image/png, image/jpeg"
            onChange={handleFileChange}
          />
          
          {previewUrl ? (
            <div className="file-preview">
              <img src={previewUrl} alt="Template preview" />
              <div className="file-info">
                <span>{selectedFile.name}</span>
                <button 
                  type="button" 
                  className="btn btn-sm btn-secondary"
                  onClick={handleBrowseClick}
                >
                  Change
                </button>
              </div>
            </div>
          ) : (
            <div className="drop-message">
              <div className="icon">📄</div>
              <p>Drag & drop your certificate template here</p>
              <p className="or">OR</p>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={handleBrowseClick}
              >
                Browse Files
              </button>
              <p className="file-hint">Supported formats: PNG, JPG (max 5MB)</p>
            </div>
          )}
        </div>
        {errors.file && <div className="error-message">{errors.file}</div>}
        
        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Upload Template
          </button>
        </div>
      </form>
    </div>
  );
};

export default TemplateUploader;