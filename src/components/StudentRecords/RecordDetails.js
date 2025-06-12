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
        createdAt: new Date().toISOString()
      };
      
      // Initialize empty values for each field
      formTemplate.fields.forEach(field => {
        initialData[field.region_identifier] = '';
      });
      
      setFormData(initialData);
    }
  }, [record, formTemplate]);

  const handleChange = (e, fieldId) => {
    setFormData({
      ...formData,
      [fieldId]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    const missingFields = formTemplate.fields
      .filter(field => field.required && !formData[field.region_identifier])
      .map(field => field.label);
    
    if (missingFields.length > 0) {
      alert(`Please fill in the following required fields: ${missingFields.join(', ')}`);
      return;
    }
    
    if (record) {
      updateStudentRecord(record.id, formData);
    } else {
      addStudentRecord(formData);
    }
    
    onSave();
  };

  const renderField = (field) => {
    const value = formData[field.region_identifier] || '';
    
    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleChange(e, field.region_identifier)}
            required={field.required}
          />
        );
      
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleChange(e, field.region_identifier)}
            required={field.required}
          />
        );
      
      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleChange(e, field.region_identifier)}
            required={field.required}
          />
        );
      
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleChange(e, field.region_identifier)}
            required={field.required}
            rows={4}
          />
        );
      
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleChange(e, field.region_identifier)}
            required={field.required}
          >
            <option value="">Select an option</option>
            {field.options && field.options.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleChange(e, field.region_identifier)}
            required={field.required}
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