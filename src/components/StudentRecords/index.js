import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import FormTemplateSelector from './FormTemplateSelector';
import RecordsList from './RecordsList';
import RecordForm from './RecordForm';
import RecordDetails from './RecordDetails';
import './StudentRecords.css';

const StudentRecords = () => {
  const { formTemplates, studentRecords } = useAppContext();
  
  const [selectedFormTemplate, setSelectedFormTemplate] = useState(null);
  const [activeTab, setActiveTab] = useState('list');
  const [currentRecord, setCurrentRecord] = useState(null);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  
  // Show alert message
  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => {
      setAlert({ show: false, type: '', message: '' });
    }, 3000);
  };
  
  // Handle form template selection
  const handleFormTemplateSelect = (templateId) => {
    const template = formTemplates.find(t => t.id === templateId);
    setSelectedFormTemplate(template);
    setActiveTab('list');
  };
  
  // Handle add record button click
  const handleAddRecord = () => {
    setCurrentRecord(null);
    setActiveTab('add');
  };
  
  // Handle edit record button click
  const handleEditRecord = (record) => {
    setCurrentRecord(record);
    setActiveTab('edit');
  };
  
  // Handle view record button click
  const handleViewRecord = (record) => {
    setCurrentRecord(record);
    setActiveTab('view');
  };
  
  // Get filtered records based on selected form template
  const getFilteredRecords = () => {
    if (!selectedFormTemplate) return [];
    return studentRecords.filter(record => record.formTemplateId === selectedFormTemplate.id);
  };
  
  return (
    <div className="student-records">
      <h2 className="section-title">Student Records</h2>
      
      {alert.show && (
        <div className={`alert alert-${alert.type}`}>
          {alert.message}
        </div>
      )}
      
      <FormTemplateSelector 
        formTemplates={formTemplates}
        selectedTemplate={selectedFormTemplate}
        onSelect={handleFormTemplateSelect}
      />
      
      {selectedFormTemplate ? (
        <div className="records-container">
          <div className="tabs">
            <div 
              className={`tab ${activeTab === 'list' ? 'active' : ''}`}
              onClick={() => setActiveTab('list')}
            >
              Records List
            </div>
            <div 
              className={`tab ${activeTab === 'add' ? 'active' : ''}`}
              onClick={handleAddRecord}
            >
              Add Record
            </div>
            {activeTab === 'edit' && (
              <div className="tab active">
                Edit Record
              </div>
            )}
            {activeTab === 'view' && (
              <div className="tab active">
                View Record
              </div>
            )}
          </div>
          
          <div className="tab-content">
            {activeTab === 'list' && (
              <div>
                <div className="records-header">
                  <h3>Records for {selectedFormTemplate.name}</h3>
                  <button className="btn" onClick={handleAddRecord}>
                    Add New Record
                  </button>
                </div>
                <RecordsList 
                  records={getFilteredRecords()}
                  formTemplate={selectedFormTemplate}
                  onView={handleViewRecord}
                  onEdit={handleEditRecord}
                  showAlert={showAlert}
                />
              </div>
            )}
            
            {activeTab === 'add' && (
              <RecordForm 
                formTemplate={selectedFormTemplate}
                onCancel={() => setActiveTab('list')}
                showAlert={showAlert}
                setActiveTab={setActiveTab}
              />
            )}
            
            {activeTab === 'edit' && (
              <RecordForm 
                formTemplate={selectedFormTemplate}
                record={currentRecord}
                isEditing={true}
                onCancel={() => setActiveTab('list')}
                showAlert={showAlert}
                setActiveTab={setActiveTab}
              />
            )}
            
            {activeTab === 'view' && (
              <RecordDetails 
                record={currentRecord}
                formTemplate={selectedFormTemplate}
                onBack={() => setActiveTab('list')}
                onEdit={() => setActiveTab('edit')}
              />
            )}
          </div>
        </div>
      ) : (
        <div className="no-template-selected">
          <p>Please select a form template to manage student records.</p>
          {formTemplates.length === 0 && (
            <p>
              No form templates found. Please create a form template first in the{' '}
              <a href="/form-builder">Form Builder</a> section.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentRecords;