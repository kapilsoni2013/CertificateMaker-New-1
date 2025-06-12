import React from 'react';

const FormTemplateList = ({ templates, onEdit, onDelete }) => {
  if (templates.length === 0) {
    return (
      <div className="no-templates">
        <p>No form templates found. Create your first template!</p>
      </div>
    );
  }

  return (
    <div className="form-template-list">
      {templates.map((template) => (
        <div key={template.id} className="template-card">
          <div className="template-header">
            <h3 className="template-title">{template.name}</h3>
            <div className="template-actions">
              <button 
                className="btn" 
                onClick={() => onEdit(template)}
              >
                Edit
              </button>
              <button 
                className="btn btn-danger" 
                onClick={() => onDelete(template.id)}
              >
                Delete
              </button>
            </div>
          </div>
          
          <p className="template-description">{template.description}</p>
          
          <div className="template-fields">
            <h4>Fields ({template.fields.length})</h4>
            {template.fields.map((field) => (
              <div key={field.id} className="template-field">
                <div className="field-label">
                  {field.label}
                  {field.required && <span className="required-badge">*</span>}
                  <span className="field-identifier">{field.region_identifier}</span>
                </div>
                <div className="field-type">Type: {field.type}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FormTemplateList;