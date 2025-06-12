import React from 'react';

const FormTemplateSelector = ({ formTemplates, selectedTemplate, onSelect }) => {
  const handleChange = (e) => {
    const templateId = e.target.value;
    if (templateId) {
      onSelect(templateId);
    } else {
      onSelect(null);
    }
  };

  return (
    <div className="template-selector">
      <label htmlFor="formTemplate">Select Form Template:</label>
      <select
        id="formTemplate"
        value={selectedTemplate ? selectedTemplate.id : ''}
        onChange={handleChange}
      >
        <option value="">-- Select a Form Template --</option>
        {formTemplates.map((template) => (
          <option key={template.id} value={template.id}>
            {template.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FormTemplateSelector;