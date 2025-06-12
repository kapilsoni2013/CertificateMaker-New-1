import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const FormTemplateEditor = ({ template, onSave, onCancel, isEditing = false }) => {
  const [formData, setFormData] = useState(template);
  const [errors, setErrors] = useState({});
  
  // Initialize form data when template changes
  useEffect(() => {
    if (template) {
      setFormData(template);
    }
  }, [template]);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Add a new field to the form template
  const addField = () => {
    const newField = {
      id: uuidv4(),
      type: 'text',
      label: '',
      placeholder: '',
      required: false,
      region_identifier: '',
      options: []
    };
    
    setFormData({
      ...formData,
      fields: [...formData.fields, newField]
    });
  };
  
  // Update a field in the form template
  const updateField = (id, updatedField) => {
    setFormData({
      ...formData,
      fields: formData.fields.map(field => 
        field.id === id ? updatedField : field
      )
    });
  };
  
  // Delete a field from the form template
  const deleteField = (id) => {
    setFormData({
      ...formData,
      fields: formData.fields.filter(field => field.id !== id)
    });
  };
  
  // Move a field up in the list
  const moveFieldUp = (index) => {
    if (index === 0) return;
    
    const newFields = [...formData.fields];
    const temp = newFields[index];
    newFields[index] = newFields[index - 1];
    newFields[index - 1] = temp;
    
    setFormData({
      ...formData,
      fields: newFields
    });
  };
  
  // Move a field down in the list
  const moveFieldDown = (index) => {
    if (index === formData.fields.length - 1) return;
    
    const newFields = [...formData.fields];
    const temp = newFields[index];
    newFields[index] = newFields[index + 1];
    newFields[index + 1] = temp;
    
    setFormData({
      ...formData,
      fields: newFields
    });
  };
  
  // Handle field input changes
  const handleFieldChange = (id, e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    
    updateField(id, {
      ...formData.fields.find(field => field.id === id),
      [name]: fieldValue
    });
  };
  
  // Add an option to a select field
  const addOption = (fieldId) => {
    const field = formData.fields.find(field => field.id === fieldId);
    
    if (field) {
      const updatedField = {
        ...field,
        options: [...field.options, { id: uuidv4(), value: '', label: '' }]
      };
      
      updateField(fieldId, updatedField);
    }
  };
  
  // Update an option in a select field
  const updateOption = (fieldId, optionId, e) => {
    const { name, value } = e.target;
    const field = formData.fields.find(field => field.id === fieldId);
    
    if (field) {
      const updatedOptions = field.options.map(option => 
        option.id === optionId ? { ...option, [name]: value } : option
      );
      
      updateField(fieldId, {
        ...field,
        options: updatedOptions
      });
    }
  };
  
  // Delete an option from a select field
  const deleteOption = (fieldId, optionId) => {
    const field = formData.fields.find(field => field.id === fieldId);
    
    if (field) {
      const updatedOptions = field.options.filter(option => option.id !== optionId);
      
      updateField(fieldId, {
        ...field,
        options: updatedOptions
      });
    }
  };
  
  // Validate the form before submission
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Template name is required';
    }
    
    if (formData.fields.length === 0) {
      newErrors.fields = 'At least one field is required';
    }
    
    // Validate each field
    formData.fields.forEach((field, index) => {
      if (!field.label.trim()) {
        newErrors[`field_${index}_label`] = 'Field label is required';
      }
      
      if (!field.region_identifier.trim()) {
        newErrors[`field_${index}_region_identifier`] = 'Region identifier is required';
      } else if (!/^[a-z0-9_]+$/.test(field.region_identifier)) {
        newErrors[`field_${index}_region_identifier`] = 'Region identifier can only contain lowercase letters, numbers, and underscores';
      }
      
      // Check for duplicate region identifiers
      const duplicateIdentifier = formData.fields.find((f, i) => 
        i !== index && f.region_identifier === field.region_identifier
      );
      
      if (duplicateIdentifier) {
        newErrors[`field_${index}_region_identifier`] = 'Region identifier must be unique';
      }
      
      // Validate select field options
      if (field.type === 'select' && field.options.length === 0) {
        newErrors[`field_${index}_options`] = 'Select field must have at least one option';
      }
      
      if (field.type === 'select') {
        field.options.forEach((option, optionIndex) => {
          if (!option.value.trim()) {
            newErrors[`field_${index}_option_${optionIndex}_value`] = 'Option value is required';
          }
          
          if (!option.label.trim()) {
            newErrors[`field_${index}_option_${optionIndex}_label`] = 'Option label is required';
          }
        });
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
    }
  };
  
  return (
    <div className="form-template-editor">
      <form onSubmit={handleSubmit}>
        <div className="form-control">
          <label htmlFor="name">Template Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter template name"
          />
          {errors.name && <div className="error">{errors.name}</div>}
        </div>
        
        <div className="form-control">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter template description"
          />
        </div>
        
        <h3>Form Fields</h3>
        {errors.fields && <div className="error">{errors.fields}</div>}
        
        <div className="field-list">
          {formData.fields.map((field, index) => (
            <div key={field.id} className="field-item">
              <div className="field-header">
                <h4>{field.label || 'Untitled Field'}</h4>
                <div className="field-actions">
                  <button
                    type="button"
                    className="field-action-btn"
                    onClick={() => moveFieldUp(index)}
                    disabled={index === 0}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="field-action-btn"
                    onClick={() => moveFieldDown(index)}
                    disabled={index === formData.fields.length - 1}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="field-action-btn delete"
                    onClick={() => deleteField(field.id)}
                  >
                    ×
                  </button>
                </div>
              </div>
              
              <div className="field-properties">
                <div className="field-property">
                  <label htmlFor={`field_${field.id}_type`}>Field Type</label>
                  <select
                    id={`field_${field.id}_type`}
                    name="type"
                    value={field.type}
                    onChange={(e) => handleFieldChange(field.id, e)}
                  >
                    <option value="text">Text Input</option>
                    <option value="number">Number Input</option>
                    <option value="select">Dropdown/Select</option>
                    <option value="date">Date Picker</option>
                    <option value="textarea">Textarea</option>
                  </select>
                </div>
                
                <div className="field-property">
                  <label htmlFor={`field_${field.id}_label`}>Field Label</label>
                  <input
                    type="text"
                    id={`field_${field.id}_label`}
                    name="label"
                    value={field.label}
                    onChange={(e) => handleFieldChange(field.id, e)}
                    placeholder="Enter field label"
                  />
                  {errors[`field_${index}_label`] && (
                    <div className="error">{errors[`field_${index}_label`]}</div>
                  )}
                </div>
                
                <div className="field-property">
                  <label htmlFor={`field_${field.id}_placeholder`}>Placeholder</label>
                  <input
                    type="text"
                    id={`field_${field.id}_placeholder`}
                    name="placeholder"
                    value={field.placeholder}
                    onChange={(e) => handleFieldChange(field.id, e)}
                    placeholder="Enter placeholder text"
                  />
                </div>
                
                <div className="field-property">
                  <label htmlFor={`field_${field.id}_region_identifier`}>Region Identifier</label>
                  <input
                    type="text"
                    id={`field_${field.id}_region_identifier`}
                    name="region_identifier"
                    value={field.region_identifier}
                    onChange={(e) => handleFieldChange(field.id, e)}
                    placeholder="e.g., student_name, roll_number"
                  />
                  <small>
                    Used to map this field to regions on certificate templates.
                    Use lowercase letters, numbers, and underscores only.
                  </small>
                  {errors[`field_${index}_region_identifier`] && (
                    <div className="error">{errors[`field_${index}_region_identifier`]}</div>
                  )}
                </div>
                
                <div className="field-property">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="required"
                      checked={field.required}
                      onChange={(e) => handleFieldChange(field.id, e)}
                    />
                    Required Field
                  </label>
                </div>
                
                {field.type === 'select' && (
                  <div className="field-property">
                    <label>Options</label>
                    {errors[`field_${index}_options`] && (
                      <div className="error">{errors[`field_${index}_options`]}</div>
                    )}
                    
                    <div className="options-list">
                      {field.options.map((option, optionIndex) => (
                        <div key={option.id} className="option-item">
                          <input
                            type="text"
                            name="value"
                            value={option.value}
                            onChange={(e) => updateOption(field.id, option.id, e)}
                            placeholder="Value"
                          />
                          <input
                            type="text"
                            name="label"
                            value={option.label}
                            onChange={(e) => updateOption(field.id, option.id, e)}
                            placeholder="Label"
                          />
                          <button
                            type="button"
                            className="field-action-btn delete"
                            onClick={() => deleteOption(field.id, option.id)}
                          >
                            ×
                          </button>
                          
                          {errors[`field_${index}_option_${optionIndex}_value`] && (
                            <div className="error">{errors[`field_${index}_option_${optionIndex}_value`]}</div>
                          )}
                          {errors[`field_${index}_option_${optionIndex}_label`] && (
                            <div className="error">{errors[`field_${index}_option_${optionIndex}_label`]}</div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <button
                      type="button"
                      className="add-option-btn"
                      onClick={() => addOption(field.id)}
                    >
                      + Add Option
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <button
          type="button"
          className="add-field-btn"
          onClick={addField}
        >
          + Add Field
        </button>
        
        <div className="form-actions">
          <button type="submit" className="btn btn-success">
            {isEditing ? 'Update Template' : 'Create Template'}
          </button>
          <button
            type="button"
            className="btn"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormTemplateEditor;