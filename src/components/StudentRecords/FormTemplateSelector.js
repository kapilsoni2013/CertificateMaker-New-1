import React from 'react';
import { useAppContext } from '../../context/AppContext';
import './FormTemplateSelector.css';

const FormTemplateSelector = ({ onSelect }) => {
  const { formTemplates } = useAppContext();

  return (
    <div className="form-template-selector">
      <h3>Select Form Template</h3>
      {formTemplates.length === 0 ? (
        <p>No form templates available. Please create a form template first.</p>
      ) : (
        <div className="template-grid">
          {formTemplates.map(template => (
            <div 
              key={template.id} 
              className="template-card"
              onClick={() => onSelect(template)}
            >
              <h4>{template.name}</h4>
              <p>{template.fields.length} fields</p>
              <div className="field-preview">
                {template.fields.slice(0, 3).map(field => (
                  <span key={field.id} className="field-tag">
                    {field.label}
                  </span>
                ))}
                {template.fields.length > 3 && (
                  <span className="field-tag more">
                    +{template.fields.length - 3} more
                  </span>
                )}
              </div>
              <button className="select-btn">Select</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FormTemplateSelector;