import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import './TemplateList.css';

const TemplateList = ({ templates, onEdit }) => {
  const { deleteTemplate } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Filter templates based on search term
  const filteredTemplates = templates.filter(template => 
    template.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteClick = (templateId) => {
    setConfirmDelete(templateId);
  };

  const confirmDeleteTemplate = () => {
    if (confirmDelete) {
      deleteTemplate(confirmDelete);
      setConfirmDelete(null);
    }
  };

  const cancelDelete = () => {
    setConfirmDelete(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="template-list-container card">
      <div className="list-header">
        <h3>Certificate Templates</h3>
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredTemplates.length > 0 ? (
        <div className="templates-grid">
          {filteredTemplates.map(template => (
            <div key={template.id} className="template-card">
              <div className="template-image">
                <img src={template.imageData} alt={template.name} />
              </div>
              <div className="template-info">
                <h4>{template.name}</h4>
                <p>
                  <span className="info-label">Created:</span> {formatDate(template.createdAt)}
                </p>
                <p>
                  <span className="info-label">Regions:</span> {template.regions.length}
                </p>
              </div>
              <div className="template-actions">
                <button 
                  className="btn btn-primary" 
                  onClick={() => onEdit(template)}
                >
                  Edit Regions
                </button>
                <button 
                  className="btn btn-danger" 
                  onClick={() => handleDeleteClick(template.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-results">
          <p>No templates found matching your search.</p>
        </div>
      )}

      {confirmDelete && (
        <div className="delete-confirmation-modal">
          <div className="modal-content">
            <h4>Confirm Delete</h4>
            <p>Are you sure you want to delete this template? This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={cancelDelete}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={confirmDeleteTemplate}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateList;