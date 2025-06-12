import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { v4 as uuidv4 } from 'uuid';
import './RecordDetails.css';

const RecordDetails = ({ formTemplate, record = null, onSave, onCancel }) => {
  const [formData, setFormData] = useState({});
  const { addStudentRecord, updateStudentRecord } = useAppContext();
  
  // Initialize form data based on record (if editing) or empty values
  useEffect(() => {
    if (record) {
      setFormData({ ...record });
    } else {
      const initialData = {
        id: uuidv4(),
        formTemplateId: formTemplate.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Initialize empty values for each field
      formTemplate.fields.forEach(field => {
        initialData[field.region_identifier] = field.defaultValue || '';
      });
      
      setFormData(initialData);
    }
  }, [record, formTemplate]);

  const handleChange = (e, fieldId) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    
    setFormData({
      ...formData,
      [fieldId]: value,
      updatedAt: new Date().toISOString()
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    const missingFields = formTemplate.fields
      .filter(field => field.required && 
        (formData[field.region_identifier] === '' || formData[field.region_identifier] === undefined))
      .map(field => field.label);
    
    if (missingFields.length > 0) {
      alert(`Please fill in the following required fields: ${missingFields.join(', ')}`);
      return;
    }
    
    const updatedFormData = {
      ...formData,
      updatedAt: new Date().toISOString()
    };
    
    if (record) {
      updateStudentRecord(record.id, updatedFormData);
    } else {
      addStudentRecord(updatedFormData);
    }
    
    onSave(updatedFormData);
  };

  const renderField = (field) => {
    const value = formData[field.region_identifier] !== undefined ? formData[field.region_identifier] : '';
    
    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleChange(e, field.region_identifier)}
            required={field.required}
            placeholder={field.placeholder || ''}
            disabled={field.disabled}
          />
        );
      
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleChange(e, field.region_identifier)}
            required={field.required}
            min={field.min}
            max={field.max}
            step={field.step || 1}
            placeholder={field.placeholder || ''}
            disabled={field.disabled}
          />
        );
      
      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleChange(e, field.region_identifier)}
            required={field.required}
            min={field.min}
            max={field.max}
            disabled={field.disabled}
          />
        );
      
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleChange(e, field.region_identifier)}
            required={field.required}
            rows={field.rows || 4}
            placeholder={field.placeholder || ''}
            disabled={field.disabled}
          />
        );
      
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleChange(e, field.region_identifier)}
            required={field.required}
            disabled={field.disabled}
          >
            <option value="">{field.placeholder || 'Select an option'}</option>
            {field.options && field.options.map((option, index) => (
              <option key={index} value={option.value || option}>
                {option.label || option}
              </option>
            ))}
          </select>
        );
      
      case 'checkbox':
        return (
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => handleChange(e, field.region_identifier)}
            required={field.required}
            disabled={field.disabled}
          />
        );
        
      case 'radio':
        return (
          <div className="radio-group">
            {field.options && field.options.map((option, index) => (
              <label key={index} className="radio-option">
                <input
                  type="radio"
                  name={field.region_identifier}
                  value={option.value || option}
                  checked={value === (option.value || option)}
                  onChange={(e) => handleChange(e, field.region_identifier)}
                  required={field.required}
                  disabled={field.disabled}
                />
                {option.label || option}
              </label>
            ))}
          </div>
        );
      
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleChange(e, field.region_identifier)}
            required={field.required}
            placeholder={field.placeholder || ''}
            disabled={field.disabled}
          />
        );
    }
  };

  if (!formTemplate) return null;

  return (
    <div className="record-details">
      <h3>{record ? 'Edit Record' : 'Add New Record'}</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-fields">
          {formTemplate.fields.map(field => (
            <div key={field.id} className="form-group">
              <label>
                {field.label}
                {field.required && <span className="required">*</span>}
              </label>
              {renderField(field)}
              {field.helperText && <div className="helper-text">{field.helperText}</div>}
            </div>
          ))}
        </div>
        
        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="save-btn">
            {record ? 'Update Record' : 'Save Record'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RecordDetails;