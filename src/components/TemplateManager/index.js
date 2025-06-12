import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import TemplateUploader from './TemplateUploader';
import TemplateList from './TemplateList';
import TemplateEditor from './TemplateEditor';
import './TemplateManager.css';

const TemplateManager = () => {
  const { certificateTemplates, deleteCertificateTemplate } = useAppContext();
  
  const [activeTab, setActiveTab] = useState('list');
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  
  // Show alert message
  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => {
      setAlert({ show: false, type: '', message: '' });
    }, 3000);
  };
  
  // Handle template upload
  const handleTemplateUpload = () => {
    setActiveTab('upload');
  };
  
  // Handle template edit
  const handleEditTemplate = (template) => {
    setCurrentTemplate(template);
    setActiveTab('edit');
  };
  
  // Handle template deletion
  const handleDeleteTemplate = (id) => {
    if (window.confirm('Are you sure you want to delete this certificate template?')) {
      deleteCertificateTemplate(id);
      showAlert('success', 'Certificate template deleted successfully!');
    }
  };
  
  return (
    <div className="template-manager">
      <h2 className="section-title">Certificate Template Manager</h2>
      
      {alert.show && (
        <div className={`alert alert-${alert.type}`}>
          {alert.message}
        </div>
      )}
      
      <div className="tabs">
        <div 
          className={`tab ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => setActiveTab('list')}
        >
          Template List
        </div>
        <div 
          className={`tab ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={handleTemplateUpload}
        >
          Upload Template
        </div>
        {activeTab === 'edit' && (
          <div className="tab active">
            Edit Template
          </div>
        )}
      </div>
      
      <div className="tab-content">
        {activeTab === 'list' && (
          <div>
            <div className="templates-header">
              <h3>Certificate Templates</h3>
              <button className="btn" onClick={handleTemplateUpload}>
                Upload New Template
              </button>
            </div>
            <TemplateList 
              templates={certificateTemplates}
              onEdit={handleEditTemplate}
              onDelete={handleDeleteTemplate}
            />
          </div>
        )}
        
        {activeTab === 'upload' && (
          <TemplateUploader 
            onSuccess={() => {
              showAlert('success', 'Template uploaded successfully!');
              setActiveTab('list');
            }}
            onCancel={() => setActiveTab('list')}
          />
        )}
        
        {activeTab === 'edit' && currentTemplate && (
          <TemplateEditor 
            template={currentTemplate}
            onSuccess={() => {
              showAlert('success', 'Template updated successfully!');
              setActiveTab('list');
            }}
            onCancel={() => setActiveTab('list')}
          />
        )}
      </div>
    </div>
  );
};

export default TemplateManager;