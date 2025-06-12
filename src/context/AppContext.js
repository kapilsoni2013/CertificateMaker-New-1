import React, { createContext, useContext, useState, useEffect } from 'react';

// Create context
const AppContext = createContext();

// Custom hook to use the context
export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  // State for form templates
  const [formTemplates, setFormTemplates] = useState([]);
  
  // State for student records
  const [studentRecords, setStudentRecords] = useState([]);
  
  // State for certificate templates
  const [certificateTemplates, setCertificateTemplates] = useState([]);
  
  // Load data from localStorage on initial render
  useEffect(() => {
    const loadedFormTemplates = localStorage.getItem('formTemplates');
    const loadedStudentRecords = localStorage.getItem('studentRecords');
    const loadedCertificateTemplates = localStorage.getItem('certificateTemplates');
    
    if (loadedFormTemplates) {
      setFormTemplates(JSON.parse(loadedFormTemplates));
    }
    
    if (loadedStudentRecords) {
      setStudentRecords(JSON.parse(loadedStudentRecords));
    }
    
    if (loadedCertificateTemplates) {
      setCertificateTemplates(JSON.parse(loadedCertificateTemplates));
    }
  }, []);
  
  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('formTemplates', JSON.stringify(formTemplates));
  }, [formTemplates]);
  
  useEffect(() => {
    localStorage.setItem('studentRecords', JSON.stringify(studentRecords));
  }, [studentRecords]);
  
  useEffect(() => {
    localStorage.setItem('certificateTemplates', JSON.stringify(certificateTemplates));
  }, [certificateTemplates]);
  
  // Form Templates CRUD operations
  const addFormTemplate = (template) => {
    setFormTemplates([...formTemplates, template]);
  };
  
  const updateFormTemplate = (id, updatedTemplate) => {
    setFormTemplates(
      formTemplates.map((template) => 
        template.id === id ? updatedTemplate : template
      )
    );
  };
  
  const deleteFormTemplate = (id) => {
    // Delete the form template
    setFormTemplates(formTemplates.filter((template) => template.id !== id));
    
    // Also delete all student records associated with this template
    setStudentRecords(studentRecords.filter((record) => record.formTemplateId !== id));
  };
  
  // Student Records CRUD operations
  const addStudentRecord = (record) => {
    setStudentRecords([...studentRecords, record]);
  };
  
  const updateStudentRecord = (id, updatedRecord) => {
    setStudentRecords(
      studentRecords.map((record) => 
        record.id === id ? updatedRecord : record
      )
    );
  };
  
  const deleteStudentRecord = (id) => {
    setStudentRecords(studentRecords.filter((record) => record.id !== id));
  };
  
  // Certificate Templates CRUD operations
  const addCertificateTemplate = (template) => {
    setCertificateTemplates([...certificateTemplates, template]);
  };
  
  const updateCertificateTemplate = (id, updatedTemplate) => {
    setCertificateTemplates(
      certificateTemplates.map((template) => 
        template.id === id ? updatedTemplate : template
      )
    );
  };
  
  const deleteCertificateTemplate = (id) => {
    setCertificateTemplates(certificateTemplates.filter((template) => template.id !== id));
  };
  
  // Get all region identifiers from form templates
  const getAllRegionIdentifiers = () => {
    const identifiers = new Set();
    
    formTemplates.forEach(template => {
      template.fields.forEach(field => {
        if (field.region_identifier) {
          identifiers.add(field.region_identifier);
        }
      });
    });
    
    return Array.from(identifiers);
  };
  
  // Get form templates that contain a specific region identifier
  const getFormTemplatesWithRegionIdentifier = (identifier) => {
    return formTemplates.filter(template => 
      template.fields.some(field => field.region_identifier === identifier)
    );
  };
  
  // Get student records by form template ID
  const getStudentRecordsByFormTemplate = (formTemplateId) => {
    return studentRecords.filter(record => record.formTemplateId === formTemplateId);
  };
  
  // Check if a certificate template is compatible with a form template
  const isCertificateCompatibleWithForm = (certificateTemplateId, formTemplateId) => {
    const certificateTemplate = certificateTemplates.find(
      template => template.id === certificateTemplateId
    );
    
    const formTemplate = formTemplates.find(
      template => template.id === formTemplateId
    );
    
    if (!certificateTemplate || !formTemplate) {
      return false;
    }
    
    // Get all region identifiers in the certificate template
    const certificateRegionIds = certificateTemplate.regions.map(
      region => region.region_identifier
    );
    
    // Get all region identifiers in the form template
    const formRegionIds = formTemplate.fields.map(
      field => field.region_identifier
    );
    
    // Check if all certificate region identifiers exist in the form template
    return certificateRegionIds.every(id => formRegionIds.includes(id));
  };
  
  // Value object to be provided to consumers
  const contextValue = {
    formTemplates,
    studentRecords,
    certificateTemplates,
    addFormTemplate,
    updateFormTemplate,
    deleteFormTemplate,
    addStudentRecord,
    updateStudentRecord,
    deleteStudentRecord,
    addCertificateTemplate,
    updateCertificateTemplate,
    deleteCertificateTemplate,
    getAllRegionIdentifiers,
    getFormTemplatesWithRegionIdentifier,
    getStudentRecordsByFormTemplate,
    isCertificateCompatibleWithForm
  };
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;