import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import TemplateUploader from './TemplateUploader';
import TemplateList from './TemplateList';
import TemplateEditor from './TemplateEditor';
import './TemplateManager.css';

const TemplateManager = () => {
  const { templates, formTemplates } = useAppContext();
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [isUploaderVisible, setIsUploaderVisible] = useState(false);
  const [availableRegionIdentifiers, setAvailableRegionIdentifiers] = useState([]);

  // Extract all available region identifiers from form templates
  useEffect(() => {
    if (formTemplates && formTemplates.length > 0) {
      const regionMap = new Map();
      
      formTemplates.forEach(formTemplate => {
        if (formTemplate.regions && formTemplate.regions.length > 0) {
          formTemplate.regions.forEach(region => {
            if (!regionMap.has(region.identifier)) {
              regionMap.set(region.identifier, [formTemplate.name]);
            } else {
              regionMap.get(region.identifier).push(formTemplate.name);
            }
          });
        }
      });
      
      // Convert map to array of objects with identifier and associated templates
      const regions = Array.from(regionMap).map(([identifier, templates]) => ({
        identifier,
        templates
      }));
      
      setAvailableRegionIdentifiers(regions);
    }
  }, [formTemplates]);

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

  const validateRegionIdentifier = (identifier) => {
    return availableRegionIdentifiers.some(region => region.identifier === identifier);
  };

  const getTemplatesForRegion = (identifier) => {
    const region = availableRegionIdentifiers.find(r => r.identifier === identifier);
    return region ? region.templates : [];
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
          availableRegionIdentifiers={availableRegionIdentifiers}
          validateRegionIdentifier={validateRegionIdentifier}
          getTemplatesForRegion={getTemplatesForRegion}
        />
      )}

      {templates.length > 0 ? (
        <TemplateList 
          templates={templates} 
          onEdit={handleEditTemplate}
          availableRegionIdentifiers={availableRegionIdentifiers}
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