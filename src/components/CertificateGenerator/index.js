import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import CertificatePreview from './CertificatePreview';
import './CertificateGenerator.css';

const CertificateGenerator = () => {
  const {
    formTemplates,
    certificateTemplates,
    studentRecords,
    getStudentRecordsByFormTemplate,
    isCertificateCompatibleWithForm
  } = useAppContext();
  
  const [selectedFormTemplate, setSelectedFormTemplate] = useState(null);
  const [selectedCertificateTemplate, setSelectedCertificateTemplate] = useState(null);
  const [selectedStudentRecord, setSelectedStudentRecord] = useState(null);
  const [compatibleCertificates, setCompatibleCertificates] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [batchMode, setBatchMode] = useState(false);
  const [selectedRecords, setSelectedRecords] = useState([]);
  
  // Show alert message
  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => {
      setAlert({ show: false, type: '', message: '' });
    }, 3000);
  };
  
  // Update compatible certificates when form template changes
  useEffect(() => {
    if (selectedFormTemplate) {
      const compatible = certificateTemplates.filter(template => 
        isCertificateCompatibleWithForm(template.id, selectedFormTemplate.id)
      );
      
      setCompatibleCertificates(compatible);
      
      if (compatible.length === 0) {
        showAlert('info', 'No compatible certificate templates found for this form template.');
      }
      
      // Reset certificate template selection
      setSelectedCertificateTemplate(null);
      
      // Update filtered records
      const records = getStudentRecordsByFormTemplate(selectedFormTemplate.id);
      setFilteredRecords(records);
      
      // Reset student record selection
      setSelectedStudentRecord(null);
      setSelectedRecords([]);
    } else {
      setCompatibleCertificates([]);
      setFilteredRecords([]);
    }
  }, [selectedFormTemplate, certificateTemplates, isCertificateCompatibleWithForm, getStudentRecordsByFormTemplate]);
  
  // Handle form template selection
  const handleFormTemplateChange = (e) => {
    const templateId = e.target.value;
    if (templateId) {
      const template = formTemplates.find(t => t.id === templateId);
      setSelectedFormTemplate(template);
    } else {
      setSelectedFormTemplate(null);
    }
  };
  
  // Handle certificate template selection
  const handleCertificateTemplateChange = (e) => {
    const templateId = e.target.value;
    if (templateId) {
      const template = certificateTemplates.find(t => t.id === templateId);
      setSelectedCertificateTemplate(template);
    } else {
      setSelectedCertificateTemplate(null);
    }
  };
  
  // Handle student record selection
  const handleStudentRecordChange = (e) => {
    const recordId = e.target.value;
    if (recordId) {
      const record = studentRecords.find(r => r.id === recordId);
      setSelectedStudentRecord(record);
    } else {
      setSelectedStudentRecord(null);
    }
  };
  
  // Handle batch mode toggle
  const handleBatchModeToggle = () => {
    setBatchMode(!batchMode);
    setSelectedStudentRecord(null);
    setSelectedRecords([]);
  };
  
  // Handle record selection for batch mode
  const handleRecordSelection = (recordId) => {
    if (selectedRecords.includes(recordId)) {
      setSelectedRecords(selectedRecords.filter(id => id !== recordId));
    } else {
      setSelectedRecords([...selectedRecords, recordId]);
    }
  };
  
  // Handle select all records
  const handleSelectAllRecords = () => {
    if (selectedRecords.length === filteredRecords.length) {
      setSelectedRecords([]);
    } else {
      setSelectedRecords(filteredRecords.map(record => record.id));
    }
  };
  
  // Get selected records for batch generation
  const getSelectedRecordsForBatch = () => {
    return filteredRecords.filter(record => selectedRecords.includes(record.id));
  };
  
  return (
    <div className="certificate-generator">
      <h2 className="section-title">Certificate Generator</h2>
      
      {alert.show && (
        <div className={`alert alert-${alert.type}`}>
          {alert.message}
        </div>
      )}
      
      <div className="generator-form">
        <div className="form-control">
          <label htmlFor="formTemplate">1. Select Form Template</label>
          <select
            id="formTemplate"
            value={selectedFormTemplate ? selectedFormTemplate.id : ''}
            onChange={handleFormTemplateChange}
          >
            <option value="">-- Select a Form Template --</option>
            {formTemplates.map(template => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        </div>
        
        {selectedFormTemplate && (
          <div className="form-control">
            <label htmlFor="certificateTemplate">2. Select Certificate Template</label>
            <select
              id="certificateTemplate"
              value={selectedCertificateTemplate ? selectedCertificateTemplate.id : ''}
              onChange={handleCertificateTemplateChange}
              disabled={compatibleCertificates.length === 0}
            >
              <option value="">-- Select a Certificate Template --</option>
              {compatibleCertificates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
            {compatibleCertificates.length === 0 && (
              <div className="info-text">
                No compatible certificate templates found. Please create a certificate template with regions that match this form template's fields.
              </div>
            )}
          </div>
        )}
        
        {selectedFormTemplate && selectedCertificateTemplate && (
          <div className="form-control">
            <div className="batch-toggle">
              <label>
                <input
                  type="checkbox"
                  checked={batchMode}
                  onChange={handleBatchModeToggle}
                />
                Batch Generation Mode
              </label>
            </div>
            
            {!batchMode ? (
              <>
                <label htmlFor="studentRecord">3. Select Student Record</label>
                <select
                  id="studentRecord"
                  value={selectedStudentRecord ? selectedStudentRecord.id : ''}
                  onChange={handleStudentRecordChange}
                  disabled={filteredRecords.length === 0}
                >
                  <option value="">-- Select a Student Record --</option>
                  {filteredRecords.map(record => {
                    // Get a display name from the first field
                    const firstField = selectedFormTemplate.fields[0];
                    const displayValue = record.data[firstField.id] || 'Unnamed Record';
                    
                    return (
                      <option key={record.id} value={record.id}>
                        {displayValue}
                      </option>
                    );
                  })}
                </select>
                {filteredRecords.length === 0 && (
                  <div className="info-text">
                    No student records found for this form template. Please add student records first.
                  </div>
                )}
              </>
            ) : (
              <div className="batch-selection">
                <label>3. Select Records for Batch Generation</label>
                
                <div className="batch-header">
                  <button
                    type="button"
                    className="btn"
                    onClick={handleSelectAllRecords}
                  >
                    {selectedRecords.length === filteredRecords.length ? 'Deselect All' : 'Select All'}
                  </button>
                  <span>{selectedRecords.length} of {filteredRecords.length} selected</span>
                </div>
                
                <div className="batch-records-list">
                  {filteredRecords.length === 0 ? (
                    <div className="info-text">
                      No student records found for this form template. Please add student records first.
                    </div>
                  ) : (
                    filteredRecords.map(record => {
                      // Get a display name from the first field
                      const firstField = selectedFormTemplate.fields[0];
                      const displayValue = record.data[firstField.id] || 'Unnamed Record';
                      
                      return (
                        <div
                          key={record.id}
                          className={`batch-record-item ${selectedRecords.includes(record.id) ? 'selected' : ''}`}
                        >
                          <label>
                            <input
                              type="checkbox"
                              checked={selectedRecords.includes(record.id)}
                              onChange={() => handleRecordSelection(record.id)}
                            />
                            {displayValue}
                          </label>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {selectedFormTemplate && selectedCertificateTemplate && (
        <div className="certificate-preview-container">
          {!batchMode && selectedStudentRecord ? (
            <CertificatePreview
              certificateTemplate={selectedCertificateTemplate}
              formTemplate={selectedFormTemplate}
              studentRecord={selectedStudentRecord}
              showAlert={showAlert}
            />
          ) : batchMode && selectedRecords.length > 0 ? (
            <CertificatePreview
              certificateTemplate={selectedCertificateTemplate}
              formTemplate={selectedFormTemplate}
              studentRecords={getSelectedRecordsForBatch()}
              batchMode={true}
              showAlert={showAlert}
            />
          ) : (
            <div className="no-preview">
              <p>
                {batchMode
                  ? 'Select at least one record to generate certificates in batch mode.'
                  : 'Select a student record to preview the certificate.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CertificateGenerator;