import React, { useState, useEffect, useContext } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { v4 as uuidv4 } from 'uuid';
import { AppContext } from '../../context/AppContext';
import './DynamicFormBuilder.css'; // Assuming you'll create this CSS file

// Icon components
const AddIcon = () => <span>➕</span>;
const DeleteIcon = () => <span>🗑️</span>;
const EditIcon = () => <span>✏️</span>;
const DragIcon = () => <span>⋮⋮</span>;
const SaveIcon = () => <span>💾</span>;
const PreviewIcon = () => <span>👁️</span>;

const fieldTypes = [
  { value: 'text', label: 'Text Input' },
  { value: 'number', label: 'Number Input' },
  { value: 'select', label: 'Dropdown/Select' },
  { value: 'date', label: 'Date Picker' },
  { value: 'textarea', label: 'Textarea' }
];

const DynamicFormBuilder = () => {
  const { 
    formTemplates, 
    setFormTemplates, 
    saveToLocalStorage 
  } = useContext(AppContext);
  
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [formName, setFormName] = useState('');
  const [fields, setFields] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
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

  // Load templates from context on component mount
  useEffect(() => {
    if (!formTemplates) {
      setFormTemplates([]);
    }
  }, [formTemplates, setFormTemplates]);

  const handleCreateTemplate = () => {
    setCurrentTemplate(null);
    setFormName('');
    setFields([]);
    setIsEditing(true);
  };

  const handleEditTemplate = (template) => {
    setCurrentTemplate(template);
    setFormName(template.name);
    setFields([...template.fields]);
    setIsEditing(true);
  };

  const handleDeleteTemplate = (templateId) => {
    const updatedTemplates = formTemplates.filter(t => t.id !== templateId);
    setFormTemplates(updatedTemplates);
    saveToLocalStorage('formTemplates', updatedTemplates);
  };

  const handleSaveTemplate = () => {
    if (!formName.trim()) {
      setErrors({...errors, formName: 'Form name is required'});
      return;
    }
    
    if (fields.length === 0) {
      setErrors({...errors, fields: 'At least one field is required'});
      return;
    }

    // Check for duplicate region identifiers
    const identifiers = fields.map(f => f.region_identifier);
    const hasDuplicates = identifiers.some((id, index) => 
      identifiers.indexOf(id) !== index
    );
    
    if (hasDuplicates) {
      setErrors({...errors, fields: 'Duplicate region identifiers found'});
      return;
    }

    const template = {
      id: currentTemplate ? currentTemplate.id : uuidv4(),
      name: formName,
      fields: fields,
      createdAt: currentTemplate ? currentTemplate.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    let updatedTemplates;
    if (currentTemplate) {
      updatedTemplates = formTemplates.map(t => 
        t.id === template.id ? template : t
      );
    } else {
      updatedTemplates = [...formTemplates, template];
    }

    setFormTemplates(updatedTemplates);
    saveToLocalStorage('formTemplates', updatedTemplates);
    setIsEditing(false);
    setErrors({});
  };

  const handleOpenFieldDialog = (field = null) => {
    if (field) {
      setCurrentField({...field});
    } else {
      setCurrentField({
        id: uuidv4(),
        type: 'text',
        label: '',
        region_identifier: '',
        required: false,
        options: []
      });
    }
    setOpenDialog(true);
  };

  const handleCloseFieldDialog = () => {
    setOpenDialog(false);
    setSelectOption('');
  };

  const handleAddField = () => {
    // Validate field
    const fieldErrors = {};
    if (!currentField.label.trim()) {
      fieldErrors.label = 'Label is required';
    }
    if (!currentField.region_identifier.trim()) {
      fieldErrors.region_identifier = 'Region identifier is required';
    } else if (!/^[a-z0-9_]+$/.test(currentField.region_identifier)) {
      fieldErrors.region_identifier = 'Only lowercase letters, numbers, and underscores allowed';
    } else {
      // Check for duplicate identifiers (excluding current field if editing)
      const isDuplicate = fields.some(f => 
        f.region_identifier === currentField.region_identifier && 
        f.id !== currentField.id
      );
      if (isDuplicate) {
        fieldErrors.region_identifier = 'This identifier is already used';
      }
    }

    if (currentField.type === 'select' && currentField.options.length === 0) {
      fieldErrors.options = 'At least one option is required';
    }

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    // Add or update field
    let updatedFields;
    const existingFieldIndex = fields.findIndex(f => f.id === currentField.id);
    
    if (existingFieldIndex >= 0) {
      updatedFields = [...fields];
      updatedFields[existingFieldIndex] = {...currentField};
    } else {
      updatedFields = [...fields, {...currentField}];
    }
    
    setFields(updatedFields);
    handleCloseFieldDialog();
    setErrors({});
  };

  const handleDeleteField = (fieldId) => {
    setFields(fields.filter(f => f.id !== fieldId));
  };

  const handleAddOption = () => {
    if (!selectOption.trim()) {
      setErrors({...errors, selectOption: 'Option cannot be empty'});
      return;
    }
    
    setCurrentField({
      ...currentField,
      options: [...currentField.options, selectOption.trim()]
    });
    
    setSelectOption('');
    setErrors({...errors, selectOption: null, options: null});
  };

  const handleRemoveOption = (index) => {
    const updatedOptions = [...currentField.options];
    updatedOptions.splice(index, 1);
    setCurrentField({...currentField, options: updatedOptions});
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(fields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setFields(items);
  };

  // Render form preview
  const renderFormPreview = () => {
    if (!showPreview) return null;
    
    return (
      <div className="dialog-overlay">
        <div className="dialog dialog-md">
          <div className="dialog-title">
            Form Preview: {formName}
          </div>
          <div className="dialog-content">
            <div className="box mt-16">
              {fields.map((field) => (
                <div key={field.id} className="box mb-24">
                  {field.type === 'text' && (
                    <div className="text-field">
                      <label>{field.label}{field.required && ' *'}</label>
                      <input type="text" />
                      <div className="helper-text">Region ID: {field.region_identifier}</div>
                    </div>
                  )}
                  {field.type === 'number' && (
                    <div className="text-field">
                      <label>{field.label}{field.required && ' *'}</label>
                      <input type="number" />
                      <div className="helper-text">Region ID: {field.region_identifier}</div>
                    </div>
                  )}
                  {field.type === 'textarea' && (
                    <div className="text-field">
                      <label>{field.label}{field.required && ' *'}</label>
                      <textarea rows="4"></textarea>
                      <div className="helper-text">Region ID: {field.region_identifier}</div>
                    </div>
                  )}
                  {field.type === 'date' && (
                    <div className="text-field">
                      <label>{field.label}{field.required && ' *'}</label>
                      <input type="date" />
                      <div className="helper-text">Region ID: {field.region_identifier}</div>
                    </div>
                  )}
                  {field.type === 'select' && (
                    <div className="text-field">
                      <label>{field.label}{field.required && ' *'}</label>
                      <select>
                        <option value="">Select...</option>
                        {field.options.map((option, idx) => (
                          <option key={idx} value={option}>{option}</option>
                        ))}
                      </select>
                      <div className="helper-text">Region ID: {field.region_identifier}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="dialog-actions">
            <button className="btn" onClick={() => setShowPreview(false)}>Close</button>
          </div>
        </div>
      </div>
    );
  };

  // Render field dialog
  const renderFieldDialog = () => {
    if (!openDialog) return null;
    
    return (
      <div className="dialog-overlay">
        <div className="dialog">
          <div className="dialog-title">
            {currentField.id ? 'Edit Field' : 'Add New Field'}
          </div>
          <div className="dialog-content">
            <div className="box mt-16">
              <div className={`text-field mb-16 ${errors.label ? 'error' : ''}`}>
                <label>Field Label</label>
                <input
                  type="text"
                  value={currentField.label}
                  onChange={(e) => setCurrentField({...currentField, label: e.target.value})}
                />
                {errors.label && <div className="helper-text">{errors.label}</div>}
              </div>
              
              <div className={`text-field mb-16 ${errors.region_identifier ? 'error' : ''}`}>
                <label>Region Identifier</label>
                <input
                  type="text"
                  value={currentField.region_identifier}
                  onChange={(e) => setCurrentField({
                    ...currentField, 
                    region_identifier: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_')
                  })}
                />
                <div className="helper-text">
                  {errors.region_identifier || "Unique identifier used to map data to certificate regions"}
                </div>
              </div>
              
              <div className="text-field mb-16">
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
              
              {currentField.type === 'select' && (
                <div className="box mb-16">
                  <div className="typography subtitle2 mb-8">Options</div>
                  
                  <div className="flex-box mb-8">
                    <div className={`text-field mb-0 flex-grow-1 ${errors.selectOption ? 'error' : ''}`}>
                      <input
                        type="text"
                        placeholder="Add Option"
                        value={selectOption}
                        onChange={(e) => setSelectOption(e.target.value)}
                      />
                      {errors.selectOption && <div className="helper-text">{errors.selectOption}</div>}
                    </div>
                    <button className="btn btn-contained ml-8" onClick={handleAddOption}>
                      Add
                    </button>
                  </div>
                  
                  {errors.options && (
                    <div className="typography caption text-error">
                      {errors.options}
                    </div>
                  )}
                  
                  <div className="paper p-8 mt-8">
                    {currentField.options.length === 0 ? (
                      <div className="typography body2 text-secondary">
                        No options added yet
                      </div>
                    ) : (
                      currentField.options.map((option, index) => (
                        <div 
                          key={index} 
                          className="flex-box justify-between align-center p-8"
                          style={{
                            borderBottom: index < currentField.options.length - 1 ? '1px solid #eee' : 'none'
                          }}
                        >
                          <div className="typography">{option}</div>
                          <button className="icon-btn" onClick={() => handleRemoveOption(index)}>
                            <DeleteIcon />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
              
              <div className="box mt-16">
                <label style={{display: 'flex', alignItems: 'center'}}>
                  <input
                    type="checkbox"
                    checked={currentField.required}
                    onChange={(e) => setCurrentField({...currentField, required: e.target.checked})}
                    style={{marginRight: '8px'}}
                  />
                  Required Field
                </label>
              </div>
            </div>
          </div>
          <div className="dialog-actions">
            <button className="btn" onClick={handleCloseFieldDialog}>Cancel</button>
            <button className="btn btn-contained" onClick={handleAddField}>
              {currentField.id ? 'Update Field' : 'Add Field'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Form builder interface
  const renderFormBuilder = () => {
    return (
      <div className="container">
        <div className="box mb-24">
          <div className={`text-field ${errors.formName ? 'error' : ''}`}>
            <label>Form Template Name</label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
            />
            {errors.formName && <div className="helper-text">{errors.formName}</div>}
          </div>
        </div>
        
        <div className="flex-box mb-24 justify-between">
          <div className="typography h6">
            Form Fields
            {errors.fields && (
              <span className="typography text-error" style={{marginLeft: '16px', fontSize: '0.8rem'}}>
                {errors.fields}
              </span>
            )}
          </div>
          <button 
            className="btn btn-contained" 
            onClick={() => handleOpenFieldDialog()}
          >
            <AddIcon /> Add Field
          </button>
        </div>
        
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="fields">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                style={{marginBottom: '24px'}}
              >
                {fields.length === 0 ? (
                  <div 
                    className="paper p-24 bg-light"
                    style={{textAlign: 'center'}}
                  >
                    <div className="typography text-secondary">
                      No fields added yet. Click "Add Field" to start building your form.
                    </div>
                  </div>
                ) : (
                  fields.map((field, index) => (
                    <Draggable key={field.id} draggableId={field.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="paper p-16 mb-16"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            ...provided.draggableProps.style
                          }}
                        >
                          <div {...provided.dragHandleProps} style={{marginRight: '16px', color: '#666'}}>
                            <DragIcon />
                          </div>
                          
                          <div className="box flex-grow-1">
                            <div className="typography subtitle1">
                              {field.label}
                              {field.required && (
                                <span className="typography text-error" style={{marginLeft: '4px'}}>*</span>
                              )}
                            </div>
                            
                            <div className="flex-box align-center mt-4">
                              <div className="typography caption text-secondary mr-16">
                                Type: {fieldTypes.find(t => t.value === field.type)?.label}
                              </div>
                              <div className="typography caption text-primary">
                                Region ID: {field.region_identifier}
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <button 
                              className="icon-btn"
                              onClick={() => handleOpenFieldDialog(field)}
                              style={{marginRight: '8px'}}
                            >
                              <EditIcon />
                            </button>
                            <button 
                              className="icon-btn"
                              onClick={() => handleDeleteField(field.id)}
                            >
                              <DeleteIcon />
                            </button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        
        <div className="flex-box justify-between">
          <button 
            className="btn btn-outlined" 
            onClick={() => setIsEditing(false)}
          >
            Cancel
          </button>
          <div>
            <button 
              className="btn btn-outlined mr-16" 
              onClick={() => setShowPreview(true)}
              disabled={fields.length === 0}
            >
              <PreviewIcon /> Preview Form
            </button>
            <button 
              className="btn btn-contained" 
              onClick={handleSaveTemplate}
            >
              <SaveIcon /> Save Template
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Template list view
  const renderTemplateList = () => {
    return (
      <div className="container">
        <div className="flex-box mb-24 justify-between align-center">
          <div className="typography h5">Dynamic Form Templates</div>
          <button 
            className="btn btn-contained" 
            onClick={handleCreateTemplate}
          >
            <AddIcon /> Create New Template
          </button>
        </div>
        
        {formTemplates.length === 0 ? (
          <div className="paper p-24 bg-light" style={{textAlign: 'center'}}>
            <div className="typography h6 text-secondary mb-16">
              No Form Templates Yet
            </div>
            <div className="typography text-secondary mb-16">
              Create your first dynamic form template to get started.
            </div>
            <button 
              className="btn btn-outlined" 
              onClick={handleCreateTemplate}
            >
              <AddIcon /> Create Template
            </button>
          </div>
        ) : (
          <div className="grid">
            {formTemplates.map((template) => (
              <div key={template.id} className="grid-item">
                <div className="card">
                  <div className="card-content">
                    <div className="typography h6 mb-8">
                      {template.name}
                    </div>
                    <div className="typography body2 text-secondary mb-8">
                      {template.fields.length} field{template.fields.length !== 1 ? 's' : ''}
                    </div>
                    <hr className="divider" />
                    <div className="box mt-8">
                      {template.fields.slice(0, 3).map((field) => (
                        <div key={field.id} className="typography caption block text-secondary">
                          • {field.label} ({field.region_identifier})
                        </div>
                      ))}
                      {template.fields.length > 3 && (
                        <div className="typography caption text-secondary">
                          ...and {template.fields.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="card-actions">
                    <button 
                      className="btn"
                      onClick={() => handleEditTemplate(template)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn text-error"
                      onClick={() => handleDeleteTemplate(template.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {isEditing ? renderFormBuilder() : renderTemplateList()}
      {renderFieldDialog()}
      {renderFormPreview()}
    </div>
  );
};

export default DynamicFormBuilder;