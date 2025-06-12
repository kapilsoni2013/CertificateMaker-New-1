import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { v4 as uuidv4 } from 'uuid';
import FormTemplateList from './FormTemplateList';
import FormTemplateEditor from './FormTemplateEditor';
import './DynamicFormBuilder.css';

const DynamicFormBuilder = () => {
  const { formTemplates, addFormTemplate, updateFormTemplate, deleteFormTemplate } = useAppContext();
  
  const [activeTab, setActiveTab] = useState('list');
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  
  // Reset current template when switching to create tab
  useEffect(() => {
    if (activeTab === 'create') {
      setCurrentTemplate({
        id: uuidv4(),
        name: '',
        description: '',
        fields: []
      });
    }
  }, [activeTab]);
  
  // Show alert message
  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => {
      setAlert({ show: false, type: '', message: '' });
    }, 3000);
  };
  
  // Handle form template creation
  const handleCreateTemplate = (template) => {
    addFormTemplate(template);
    showAlert('success', 'Form template created successfully!');
    setActiveTab('list');
  };
  
  // Handle form template update
  const handleUpdateTemplate = (template) => {
    updateFormTemplate(template.id, template);
    showAlert('success', 'Form template updated successfully!');
    setActiveTab('list');
  };
  
  // Handle form template deletion
  const handleDeleteTemplate = (id) => {
    if (window.confirm('Are you sure you want to delete this form template? All associated student records will also be deleted.')) {
      deleteFormTemplate(id);
      showAlert('success', 'Form template deleted successfully!');
    }
  };
  
  // Handle edit button click
  const handleEditTemplate = (template) => {
    setCurrentTemplate(template);
    setActiveTab('edit');
  };
  
  return (
    <div className="dynamic-form-builder">
      <h2 className="section-title">Dynamic Form Builder</h2>
      
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
          Form Templates
        </div>
        <div 
          className={`tab ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          Create New Template
        </div>
        {activeTab === 'edit' && (
          <div className="tab active">
            Edit Template
          </div>
        )}
      </div>
      
      <div className="tab-content">
        {activeTab === 'list' && (
          <FormTemplateList 
            templates={formTemplates} 
            onEdit={handleEditTemplate}
            onDelete={handleDeleteTemplate}
          />
        )}
        
        {activeTab === 'create' && (
          <FormTemplateEditor 
            template={currentTemplate}
            onSave={handleCreateTemplate}
            onCancel={() => setActiveTab('list')}
          />
        )}
        
        {activeTab === 'edit' && (
          <FormTemplateEditor 
            template={currentTemplate}
            onSave={handleUpdateTemplate}
            onCancel={() => setActiveTab('list')}
            isEditing={true}
          />
        )}
      </div>
    </div>
  );
};

export default DynamicFormBuilder;