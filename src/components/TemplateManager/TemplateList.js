import React from 'react';

const TemplateList = ({ templates, onEdit, onDelete }) => {
  if (templates.length === 0) {
    return (
      <div className="no-templates">
        <p>No certificate templates found. Upload your first template!</p>
      </div>
    );
  }
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  return (
    <div className="template-grid">
      {templates.map(template => (
        <div key={template.id} className="template-card">
          <div className="template-card-header">
            <h3 className="template-card-title">{template.name}</h3>
            <div className="template-card-actions">
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
          
          <img
            src={template.imageData}
            alt={template.name}
            className="template-card-image"
          />
          
          <div className="template-card-info">
            <p>Created: {formatDate(template.createdAt)}</p>
            <p>Regions: {template.regions.length}</p>
          </div>
          
          {template.regions.length > 0 && (
            <div className="template-card-regions">
              <p><strong>Mapped Regions:</strong></p>
              <ul>
                {template.regions.slice(0, 3).map(region => (
                  <li key={region.id}>{region.region_identifier}</li>
                ))}
                {template.regions.length > 3 && (
                  <li>...and {template.regions.length - 3} more</li>
                )}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default TemplateList;