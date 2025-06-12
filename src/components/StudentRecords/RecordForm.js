import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { v4 as uuidv4 } from 'uuid';

const RecordForm = ({ formTemplate, record, isEditing = false, onCancel, showAlert, setActiveTab }) => {
  const { addStudentRecord, updateStudentRecord } = useAppContext();
  
  // Initialize form data
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  
  // Set initial form data
  useEffect(() => {
    if (isEditing && record) {
      setFormData(record.data);
    } else {
      // Initialize empty form data based on template fields
      const initialData = {};
      formTemplate.fields.forEach(field => {
        initialData[field.id] = '';
      });
      setFormData(initialData);
    }
  }, [isEditing, record, formTemplate]);
  
  // Handle form input changes
  const handleChange = (fieldId, e) => {
    const { value, type } = e.target;
    
    // Handle different input types
    let fieldValue = value;
    if (type === 'number') {
      fieldValue = value === '' ? '' : Number(value);
    }
    
    setFormData({
      ...formData,
      [fieldId]: fieldValue
    });
    
    // Clear error for this field
    if (errors[fieldId]) {
      setErrors({
        ...errors,
        [fieldId]: ''
      });
    }
  };
  
  // Validate the form
  const validateForm = () => {
    const newErrors = {};
    
    formTemplate.fields.forEach(field => {
      if (field.required && !formData[field.id]) {
        newErrors[field.id] = `${field.label} is required`;
      }
      
      // Validate number fields
      if (field.type === 'number' && formData[field.id] !== '' && isNaN(formData[field.id])) {
        newErrors[field.id] = `${field.label} must be a number`;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      if (isEditing) {
        // Update existing record
        updateStudentRecord(record.id, {
          ...record,
          data: formData,
          updatedAt: new Date().toISOString()
        });
        showAlert('success', 'Record updated successfully!');
      } else {
        // Create new record
        addStudentRecord({
          id: uuidv4(),
          formTemplateId: formTemplate.id,
          data: formData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        showAlert('success', 'Record added successfully!');
      }
      
      setActiveTab('list');
    }
  };
  
  // Render form field based on field type
  const renderField = (field) => {
    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            id={field.id}
            value={formData[field.id] || ''}
            onChange={(e) => handleChange(field.id, e)}
            placeholder={field.placeholder}
          />
        );
      case 'number':
        return (
          <input
            type="number"
            id={field.id}
            value={formData[field.id] || ''}
            onChange={(e) => handleChange(field.id, e)}
            placeholder={field.placeholder}
          />
        );
      case 'select':
        return (
          <select
            id={field.id}
            value={formData[field.id] || ''}
            onChange={(e) => handleChange(field.id, e)}
          >
            <option value="">-- Select {field.label} --</option>
            {field.options.map(option => (
              <option key={option.id} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      case 'date':
        return (
          <input
            type="date"
            id={field.id}
            value={formData[field.id] || ''}
            onChange={(e) => handleChange(field.id, e)}
          />
        );
      case 'textarea':
        return (
          <textarea
            id={field.id}
            value={formData[field.id] || ''}
            onChange={(e) => handleChange(field.id, e)}
            placeholder={field.placeholder}
          />
        );
      default:
        return (
          <input
            type="text"
            id={field.id}
            value={formData[field.id] || ''}
            onChange={(e) => handleChange(field.id, e)}
            placeholder={field.placeholder}
          />
        );
    }
  };
  
  return (
    <div className="record-form">
      <h3>{isEditing ? 'Edit Record' : 'Add New Record'}</h3>
      
      <form onSubmit={handleSubmit}>
        {formTemplate.fields.map(field => (
          <div key={field.id} className="form-control">
            <label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="required">*</span>}
            </label>
            {renderField(field)}
            {errors[field.id] && <div className="error">{errors[field.id]}</div>}
          </div>
        ))}
        
        <div className="form-actions">
          <button type="submit" className="btn btn-success">
            {isEditing ? 'Update Record' : 'Add Record'}
          </button>
          <button type="button" className="btn" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default RecordForm;