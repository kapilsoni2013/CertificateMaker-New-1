import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import './DynamicFormBuilder.css';

// Simple UUID generator
const generateId = () => {
  return 'id_' + Math.random().toString(36).substr(2, 9);
};

const fieldTypes = [
  { value: 'text', label: 'Text Input' },
  { value: 'number', label: 'Number Input' },
  { value: 'select', label: 'Dropdown/Select' },
  { value: 'date', label: 'Date Picker' },
  { value: 'textarea', label: 'Textarea' }
];

const DynamicFormBuilder = () => {
  const { formTemplates, setFormTemplates, saveToLocalStorage } = useAppContext();
  
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [formName, setFormName] = useState('');
  const [fields, setFields] = useState([]);
  const [showFieldDialog, setShowFieldDialog] = useState(false);
  const [currentField, setCurrentField] = useState({
    id: '',
    type: 'text',
    label: '',
    region_identifier: '',
    required: false,
    options: [] // For select/dropdown fields
  });
  const [errors, setErrors] = useState({});
  const [selectOption, setSelectOption] = useState('');
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);

  useEffect(() => {
    if (currentTemplate) {
      setFormName(currentTemplate.name);
      setFields(currentTemplate.fields);
    } else {
      setFormName('');
      setFields([]);
    }
  }, [currentTemplate]);

  const validateField = (field) => {
    const newErrors = {};
    
    if (!field.label.trim()) {
      newErrors.label = 'Label is required';
    }
    
    if (!field.region_identifier.trim()) {
      newErrors.region_identifier = 'Region identifier is required';
    } else if (!/^[a-z0-9_]+$/i.test(field.region_identifier)) {
      newErrors.region_identifier = 'Region identifier can only contain letters, numbers, and underscores';
    } else {
      // Check for duplicates, but exclude the current field if editing
      const duplicateField = fields.find(f => 
        f.region_identifier === field.region_identifier && f.id !== field.id
      );
      
      if (duplicateField) {
        newErrors.region_identifier = 'Region identifier must be unique';
      }
    }
    
    if (field.type === 'select' && (!field.options || field.options.length === 0)) {
      newErrors.options = 'Select field must have at least one option';
    }
    
    return newErrors;
  };

  const handleAddField = () => {
    setCurrentField({
      id: generateId(),
      type: 'text',
      label: '',
      region_identifier: '',
      required: false,
      options: []
    });
    setErrors({});
    setShowFieldDialog(true);
  };

  const handleEditField = (field) => {
    setCurrentField({ ...field });
    setErrors({});
    setShowFieldDialog(true);
  };

  const handleDeleteField = (fieldId) => {
    if (window.confirm('Are you sure you want to delete this field?')) {
      setFields(fields.filter(field => field.id !== fieldId));
    }
  };

  const handleFieldSubmit = (e) => {
    e.preventDefault();
    
    const validationErrors = validateField(currentField);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    if (fields.find(f => f.id === currentField.id)) {
      // Update existing field
      setFields(fields.map(f => f.id === currentField.id ? currentField : f));
    } else {
      // Add new field
      setFields([...fields, currentField]);
    }
    
    setShowFieldDialog(false);
  };

  const handleAddOption = () => {
    if (!selectOption.trim()) return;
    
    setCurrentField({
      ...currentField,
      options: [...(currentField.options || []), selectOption.trim()]
    });
    
    setSelectOption('');
  };

  const handleRemoveOption = (index) => {
    const newOptions = [...currentField.options];
    newOptions.splice(index, 1);
    
    setCurrentField({
      ...currentField,
      options: newOptions
    });
  };

  const handleSaveTemplate = () => {
    if (!formName.trim()) {
      alert('Please enter a form name');
      return;
    }
    
    if (fields.length === 0) {
      alert('Please add at least one field');
      return;
    }
    
    const template = {
      id: currentTemplate?.id || generateId(),
      name: formName.trim(),
      fields: fields
    };
    
    if (isEditing) {
      // Update existing template
      setFormTemplates(formTemplates.map(t => t.id === template.id ? template : t));
    } else {
      // Add new template
      setFormTemplates([...formTemplates, template]);
    }
    
    saveToLocalStorage('formTemplates', [...formTemplates.filter(t => t.id !== template.id), template]);
    
    setCurrentTemplate(null);
    setIsEditing(false);
    setFormName('');
    setFields([]);
  };

  const handleEditTemplate = (template) => {
    setCurrentTemplate(template);
    setIsEditing(true);
    setShowPreview(false);
  };

  const handleDeleteTemplate = (templateId) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      const updatedTemplates = formTemplates.filter(t => t.id !== templateId);
      setFormTemplates(updatedTemplates);
      saveToLocalStorage('formTemplates', updatedTemplates);
    }
  };

  const handleNewTemplate = () => {
    setCurrentTemplate(null);
    setIsEditing(false);
    setFormName('');
    setFields([]);
    setShowPreview(false);
  };

  const handleDragStart = (index) => {
    setDraggedItemIndex(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (index) => {
    if (draggedItemIndex === null) return;
    if (draggedItemIndex === index) return;
    
    const newFields = [...fields];
    const draggedItem = newFields[draggedItemIndex];
    
    // Remove the dragged item
    newFields.splice(draggedItemIndex, 1);
    
    // Insert it at the new position
    newFields.splice(index, 0, draggedItem);
    
    setFields(newFields);
    setDraggedItemIndex(null);
  };

  // Render the form builder interface
  const renderFormBuilder = () => {
    return (
      <div className="form-builder">
        <div className="form-header">
          <input
            type="text"
            placeholder="Form Template Name"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            className="form-name-input"
          />
          <button className="preview-button" onClick={() => setShowPreview(!showPreview)}>
            {showPreview ? 'Edit Form' : 'Preview Form'}
          </button>
        </div>
        
        {!showPreview ? (
          <div className="form-editor">
            <div className="fields-container">
              {fields.map((field, index) => (
                <div 
                  key={field.id} 
                  className="field-item"
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(index)}
                >
                  <div className="field-drag-handle">⋮⋮</div>
                  <div className="field-info">
                    <div className="field-label">{field.label}</div>
                    <div className="field-type">{fieldTypes.find(t => t.value === field.type)?.label}</div>
                    <div className="field-identifier">ID: {field.region_identifier}</div>
                  </div>
                  <div className="field-actions">
                    <button onClick={() => handleEditField(field)} className="edit-button">Edit</button>
                    <button onClick={() => handleDeleteField(field.id)} className="delete-button">Delete</button>
                  </div>
                </div>
              ))}
              
              {fields.length === 0 && (
                <div className="empty-fields">
                  <p>No fields added yet. Click the button below to add your first field.</p>
                </div>
              )}
            </div>
            
            <button onClick={handleAddField} className="add-field-button">
              Add Field
            </button>
          </div>
        ) : (
          <div className="form-preview">
            <h3>Form Preview</h3>
            {fields.map((field) => (
              <div key={field.id} className="preview-field">
                <label>{field.label}{field.required && <span className="required">*</span>}</label>
                {renderPreviewField(field)}
              </div>
            ))}
            
            {fields.length === 0 && (
              <div className="empty-preview">
                <p>This form has no fields. Add fields to see the preview.</p>
              </div>
            )}
          </div>
        )}
        
        <div className="form-actions">
          <button onClick={handleSaveTemplate} className="save-button">
            {isEditing ? 'Update Template' : 'Save Template'}
          </button>
          <button onClick={() => setCurrentTemplate(null)} className="cancel-button">
            Cancel
          </button>
        </div>
      </div>
    );
  };

  // Render a preview field based on its type
  const renderPreviewField = (field) => {
    switch (field.type) {
      case 'text':
        return <input type="text" placeholder={`Enter ${field.label}`} disabled />;
      case 'number':
        return <input type="number" placeholder={`Enter ${field.label}`} disabled />;
      case 'textarea':
        return <textarea placeholder={`Enter ${field.label}`} disabled></textarea>;
      case 'select':
        return (
          <select disabled>
            <option value="">Select an option</option>
            {field.options && field.options.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        );
      case 'date':
        return <input type="date" disabled />;
      default:
        return <input type="text" disabled />;
    }
  };

  // Render the field dialog for adding/editing fields
  const renderFieldDialog = () => {
    if (!showFieldDialog) return null;
    
    return (
      <div className="field-dialog-overlay">
        <div className="field-dialog">
          <div className="dialog-header">
            <h3>{currentField.id ? 'Edit Field' : 'Add Field'}</h3>
            <button onClick={() => setShowFieldDialog(false)} className="close-button">×</button>
          </div>
          
          <form onSubmit={handleFieldSubmit}>
            <div className="form-group">
              <label>Field Type</label>
              <select
                value={currentField.type}
                onChange={(e) => setCurrentField({...currentField, type: e.target.value})}
              >
                {fieldTypes.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Field Label</label>
              <input
                type="text"
                value={currentField.label}
                onChange={(e) => setCurrentField({...currentField, label: e.target.value})}
                placeholder="e.g., Student Name"
              />
              {errors.label && <div className="error-message">{errors.label}</div>}
            </div>
            
            <div className="form-group">
              <label>Region Identifier</label>
              <input
                type="text"
                value={currentField.region_identifier}
                onChange={(e) => setCurrentField({...currentField, region_identifier: e.target.value})}
                placeholder="e.g., student_name"
              />
              <div className="help-text">
                Used to map this field to regions on certificate templates.
                Use only letters, numbers, and underscores.
              </div>
              {errors.region_identifier && <div className="error-message">{errors.region_identifier}</div>}
            </div>
            
            <div className="form-group checkbox">
              <input
                type="checkbox"
                id="required-field"
                checked={currentField.required}
                onChange={(e) => setCurrentField({...currentField, required: e.target.checked})}
              />
              <label htmlFor="required-field">Required Field</label>
            </div>
            
            {currentField.type === 'select' && (
              <div className="form-group">
                <label>Options</label>
                <div className="options-container">
                  {currentField.options && currentField.options.map((option, index) => (
                    <div key={index} className="option-item">
                      <span>{option}</span>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveOption(index)}
                        className="remove-option"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="add-option">
                  <input
                    type="text"
                    value={selectOption}
                    onChange={(e) => setSelectOption(e.target.value)}
                    placeholder="Add an option"
                  />
                  <button 
                    type="button" 
                    onClick={handleAddOption}
                    className="add-option-button"
                  >
                    Add
                  </button>
                </div>
                
                {errors.options && <div className="error-message">{errors.options}</div>}
              </div>
            )}
            
            <div className="dialog-actions">
              <button type="submit" className="save-button">
                {currentField.id ? 'Update Field' : 'Add Field'}
              </button>
              <button 
                type="button" 
                onClick={() => setShowFieldDialog(false)}
                className="cancel-button"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Render the template list
  const renderTemplateList = () => {
    return (
      <div className="template-list">
        <div className="list-header">
          <h3>Form Templates</h3>
          <button onClick={handleNewTemplate} className="new-template-button">
            Create New Template
          </button>
        </div>
        
        <div className="templates-container">
          {formTemplates.length > 0 ? (
            formTemplates.map((template) => (
              <div key={template.id} className="template-card">
                <div className="template-info">
                  <h4>{template.name}</h4>
                  <p>{template.fields.length} fields</p>
                </div>
                <div className="template-actions">
                  <button onClick={() => handleEditTemplate(template)} className="edit-button">
                    Edit
                  </button>
                  <button onClick={() => handleDeleteTemplate(template.id)} className="delete-button">
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-templates">
              <p>No form templates found. Create your first template to get started.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="dynamic-form-builder">
      {currentTemplate || isEditing ? renderFormBuilder() : renderTemplateList()}
      {renderFieldDialog()}
    </div>
  );
};

export default DynamicFormBuilder;