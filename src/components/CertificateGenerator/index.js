import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import CertificatePreview from './CertificatePreview';
import './CertificateGenerator.css';

const CertificateGenerator = () => {
  const { students, templates, forms, setSelectedStudent, setSelectedTemplate, setSelectedForm } = useAppContext();
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [selectedFormId, setSelectedFormId] = useState('');
  const [mappingErrors, setMappingErrors] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [compatibleTemplates, setCompatibleTemplates] = useState([]);

  // Reset preview when selections change
  useEffect(() => {
    setShowPreview(false);
    setMappingErrors([]);
  }, [selectedStudentId, selectedTemplateId, selectedFormId]);

  // Filter students based on selected form
  useEffect(() => {
    if (selectedFormId) {
      const filtered = students.filter(student => student.formId === selectedFormId);
      setFilteredStudents(filtered);
      
      // Reset student selection when form changes
      setSelectedStudentId('');
      setSelectedStudent(null);
    } else {
      setFilteredStudents([]);
    }
  }, [selectedFormId, students, setSelectedStudent]);

  // Filter templates based on selected form
  useEffect(() => {
    if (selectedFormId) {
      const selectedForm = forms.find(form => form.id === selectedFormId);
      if (selectedForm) {
        // Find templates compatible with the selected form
        const compatible = templates.filter(template => {
          const templateRegionIds = template.regions.map(region => region.identifier);
          const formFieldIds = selectedForm.fields.map(field => field.id);
          
          // Check if template regions can be mapped to form fields
          return templateRegionIds.every(regionId => formFieldIds.includes(regionId));
        });
        
        setCompatibleTemplates(compatible);
        
        // Reset template selection when form changes
        setSelectedTemplateId('');
        setSelectedTemplate(null);
      }
    } else {
      setCompatibleTemplates([]);
    }
  }, [selectedFormId, templates, forms, setSelectedTemplate]);

  // Find the selected student, template, and form objects
  const selectedStudent = students.find(s => s.id === selectedStudentId);
  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
  const selectedForm = forms.find(f => f.id === selectedFormId);

  // Handle form selection
  const handleFormChange = (e) => {
    const formId = e.target.value;
    setSelectedFormId(formId);
    
    if (formId) {
      const form = forms.find(f => f.id === formId);
      setSelectedForm(form);
    } else {
      setSelectedForm(null);
    }
  };

  // Handle student selection
  const handleStudentChange = (e) => {
    const studentId = e.target.value;
    setSelectedStudentId(studentId);
    
    if (studentId) {
      const student = students.find(s => s.id === studentId);
      setSelectedStudent(student);
    } else {
      setSelectedStudent(null);
    }
  };

  // Handle template selection
  const handleTemplateChange = (e) => {
    const templateId = e.target.value;
    setSelectedTemplateId(templateId);
    
    if (templateId) {
      const template = templates.find(t => t.id === templateId);
      setSelectedTemplate(template);
    } else {
      setSelectedTemplate(null);
    }
  };

  // Validate mapping between form data, student data and template regions
  const validateMapping = () => {
    if (!selectedStudent || !selectedTemplate || !selectedForm) {
      return false;
    }

    const errors = [];
    
    // Check if all template regions have corresponding form fields
    selectedTemplate.regions.forEach(region => {
      const matchingFormField = selectedForm.fields.find(field => field.id === region.identifier);
      
      if (!matchingFormField) {
        errors.push(`Template region "${region.name}" has no matching form field`);
      }
      
      // Check if student has data for this field
      const studentValue = selectedStudent.formData && selectedStudent.formData[region.identifier];
      if (studentValue === undefined) {
        errors.push(`Missing student data for field "${region.name}"`);
      }
    });

    setMappingErrors(errors);
    return errors.length === 0;
  };

  // Generate certificate preview
  const handleGeneratePreview = () => {
    if (validateMapping()) {
      setShowPreview(true);
    }
  };

  // Determine the active selection step
  const getSelectionStep = () => {
    if (!selectedFormId) return 1;
    if (!selectedTemplateId) return 2;
    if (!selectedStudentId) return 3;
    return 4;
  }

  const selectionStep = getSelectionStep();

  return (
    <div className="certificate-generator">
      <div className="section-header">
        <h2>Generate Certificates</h2>
      </div>

      <div className="generator-container card">
        <div className="generator-steps">
          <div className={`step ${selectionStep >= 1 ? 'active' : ''} ${selectionStep > 1 ? 'completed' : ''}`}>
            <div className="step-number">1</div>
            <div className="step-label">Select Form Template</div>
          </div>
          <div className={`step ${selectionStep >= 2 ? 'active' : ''} ${selectionStep > 2 ? 'completed' : ''}`}>
            <div className="step-number">2</div>
            <div className="step-label">Select Certificate Template</div>
          </div>
          <div className={`step ${selectionStep >= 3 ? 'active' : ''} ${selectionStep > 3 ? 'completed' : ''}`}>
            <div className="step-number">3</div>
            <div className="step-label">Select Student</div>
          </div>
          <div className={`step ${selectionStep >= 4 ? 'active' : ''}`}>
            <div className="step-number">4</div>
            <div className="step-label">Preview Certificate</div>
          </div>
        </div>

        <div className="generator-form">
          <div className="form-group">
            <label htmlFor="formSelect" className="form-label">Select Form Template</label>
            <select
              id="formSelect"
              className="form-control"
              value={selectedFormId}
              onChange={handleFormChange}
            >
              <option value="">-- Select a form template --</option>
              {forms.map(form => (
                <option key={form.id} value={form.id}>
                  {form.name}
                </option>
              ))}
            </select>
            {forms.length === 0 && (
              <div className="form-hint">
                No form templates available. Please create a form template first.
              </div>
            )}
          </div>

          {selectedFormId && (
            <div className="form-group">
              <label htmlFor="templateSelect" className="form-label">Select Certificate Template</label>
              <select
                id="templateSelect"
                className="form-control"
                value={selectedTemplateId}
                onChange={handleTemplateChange}
                disabled={!selectedFormId}
              >
                <option value="">-- Select a certificate template --</option>
                {compatibleTemplates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
              {selectedFormId && compatibleTemplates.length === 0 && (
                <div className="form-hint alert alert-warning">
                  No compatible certificate templates found for this form. Please create a template with matching field identifiers.
                </div>
              )}
            </div>
          )}

          {selectedFormId && selectedTemplateId && (
            <div className="form-group">
              <label htmlFor="studentSelect" className="form-label">Select Student</label>
              <select
                id="studentSelect"
                className="form-control"
                value={selectedStudentId}
                onChange={handleStudentChange}
                disabled={!selectedTemplateId}
              >
                <option value="">-- Select a student --</option>
                {filteredStudents.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.name} ({student.rollNumber || student.id})
                  </option>
                ))}
              </select>
              {selectedFormId && filteredStudents.length === 0 && (
                <div className="form-hint alert alert-warning">
                  No student records found for this form template. Please add student records first.
                </div>
              )}
            </div>
          )}

          {mappingErrors.length > 0 && (
            <div className="mapping-errors alert alert-danger">
              <h4>Data Mapping Errors</h4>
              <ul>
                {mappingErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
              <p>Please ensure that template regions match form fields and student data is available.</p>
            </div>
          )}

          <div className="form-actions">
            <button
              className="btn btn-primary"
              onClick={handleGeneratePreview}
              disabled={!selectedStudentId || !selectedTemplateId || !selectedFormId}
            >
              Generate Certificate
            </button>
          </div>
        </div>

        {showPreview && selectedStudent && selectedTemplate && selectedForm && (
          <CertificatePreview
            student={selectedStudent}
            template={selectedTemplate}
            form={selectedForm}
          />
        )}
      </div>
    </div>
  );
};

export default CertificateGenerator;