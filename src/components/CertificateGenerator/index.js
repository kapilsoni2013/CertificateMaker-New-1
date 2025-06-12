import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import CertificatePreview from './CertificatePreview';
import './CertificateGenerator.css';

const CertificateGenerator = () => {
  const { students, templates, setSelectedStudent, setSelectedTemplate } = useAppContext();
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [mappingErrors, setMappingErrors] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  // Reset preview when selections change
  useEffect(() => {
    setShowPreview(false);
    setMappingErrors([]);
  }, [selectedStudentId, selectedTemplateId]);

  // Find the selected student and template objects
  const selectedStudent = students.find(s => s.id === selectedStudentId);
  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

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

  // Validate mapping between student data and template regions
  const validateMapping = () => {
    if (!selectedStudent || !selectedTemplate) {
      return false;
    }

    const errors = [];
    const studentFields = {
      name: selectedStudent.name,
      roll_number: selectedStudent.rollNumber,
      class: selectedStudent.class
    };

    // Add subject marks to available fields
    if (selectedStudent.subjects) {
      selectedStudent.subjects.forEach(subject => {
        studentFields[`${subject.name.toLowerCase().replace(/\s+/g, '_')}_marks`] = subject.marks;
      });
    }

    // Check if all template regions have corresponding student data
    selectedTemplate.regions.forEach(region => {
      const fieldName = region.name.toLowerCase();
      if (studentFields[fieldName] === undefined) {
        errors.push(`No matching student data for template region "${region.name}"`);
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

  return (
    <div className="certificate-generator">
      <div className="section-header">
        <h2>Generate Certificates</h2>
      </div>

      <div className="generator-container card">
        <div className="generator-form">
          <div className="form-group">
            <label htmlFor="templateSelect" className="form-label">Select Certificate Template</label>
            <select
              id="templateSelect"
              className="form-control"
              value={selectedTemplateId}
              onChange={handleTemplateChange}
            >
              <option value="">-- Select a template --</option>
              {templates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
            {templates.length === 0 && (
              <div className="form-hint">
                No templates available. Please create a template first.
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="studentSelect" className="form-label">Select Student</label>
            <select
              id="studentSelect"
              className="form-control"
              value={selectedStudentId}
              onChange={handleStudentChange}
            >
              <option value="">-- Select a student --</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.name} ({student.rollNumber})
                </option>
              ))}
            </select>
            {students.length === 0 && (
              <div className="form-hint">
                No students available. Please add student records first.
              </div>
            )}
          </div>

          {mappingErrors.length > 0 && (
            <div className="mapping-errors alert alert-danger">
              <h4>Data Mapping Errors</h4>
              <ul>
                {mappingErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
              <p>Please ensure that template region names match student data fields.</p>
            </div>
          )}

          <div className="form-actions">
            <button
              className="btn btn-primary"
              onClick={handleGeneratePreview}
              disabled={!selectedStudentId || !selectedTemplateId}
            >
              Generate Certificate
            </button>
          </div>
        </div>

        {showPreview && selectedStudent && selectedTemplate && (
          <CertificatePreview
            student={selectedStudent}
            template={selectedTemplate}
          />
        )}
      </div>
    </div>
  );
};

export default CertificateGenerator;