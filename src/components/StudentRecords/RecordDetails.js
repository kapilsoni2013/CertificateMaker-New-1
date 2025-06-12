import React from 'react';

const RecordDetails = ({ record, formTemplate, onBack, onEdit }) => {
  // Get field value for display
  const getFieldValue = (fieldId) => {
    const field = formTemplate.fields.find(f => f.id === fieldId);
    if (!field) return '';
    
    const value = record.data[fieldId];
    
    // Format value based on field type
    if (field.type === 'select') {
      const option = field.options.find(opt => opt.value === value);
      return option ? option.label : value;
    }
    
    return value || '';
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  return (
    <div className="record-details">
      <h3>Record Details</h3>
      
      <div className="record-metadata">
        <p><strong>Created:</strong> {formatDate(record.createdAt)}</p>
        <p><strong>Last Updated:</strong> {formatDate(record.updatedAt)}</p>
      </div>
      
      <div className="record-fields">
        {formTemplate.fields.map(field => (
          <div key={field.id} className="record-field">
            <div className="record-field-label">{field.label}</div>
            <div className="record-field-value">
              {getFieldValue(field.id)}
            </div>
          </div>
        ))}
      </div>
      
      <div className="record-actions">
        <button className="btn" onClick={onBack}>
          Back to List
        </button>
        <button className="btn" onClick={() => onEdit(record)}>
          Edit Record
        </button>
      </div>
    </div>
  );
};

export default RecordDetails;