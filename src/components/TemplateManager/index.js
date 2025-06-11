import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import TemplateUploader from './TemplateUploader';
import TemplateList from './TemplateList';
import TemplateEditor from './TemplateEditor';
import './TemplateManager.css';

const TemplateManager = () => {
  const { templates } = useAppContext();
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [isUploaderVisible, setIsUploaderVisible] = useState(false);

  const handleEditTemplate = (template) => {
    setEditingTemplate(template);
  };

  const handleAddNewClick = () => {
    setIsUploaderVisible(true);
  };

  const handleUploaderClose = () => {
    setIsUploaderVisible(false);
  };

  const handleEditorClose = () => {
    setEditingTemplate(null);
  };

  return (
    <div className="template-manager">
      <div className="section-header">
        <h2>Certificate Template Manager</h2>
        <button 
          className="btn btn-primary" 
          onClick={handleAddNewClick}
        >
          Upload New Template
        </button>
      </div>

      {isUploaderVisible && (
        <div className="uploader-container">
          <TemplateUploader onClose={handleUploaderClose} />
        </div>
      )}

      {editingTemplate && (
        <TemplateEditor 
          template={editingTemplate} 
          onClose={handleEditorClose} 
        />
      )}

      {templates.length > 0 ? (
        <TemplateList 
          templates={templates} 
          onEdit={handleEditTemplate} 
        />
      ) : (
        <div className="empty-state">
          <p>No certificate templates found. Upload your first template to get started.</p>
          <button className="btn" onClick={handleAddNewClick}>
            Upload Template
          </button>
        </div>
      )}
    </div>
  );
};

export default TemplateManager;