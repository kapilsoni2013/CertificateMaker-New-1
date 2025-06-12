import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import StudentForm from './StudentForm';
import StudentList from './StudentList';
import './StudentRecords.css';
import FormTemplateSelector from '../templates/FormTemplateSelector';
import RecordDetails from '../details/RecordDetails';

const StudentRecords = () => {
  const { students, formTemplates } = useAppContext();
  const [editingStudent, setEditingStudent] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [viewingStudent, setViewingStudent] = useState(null);
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);

  useEffect(() => {
    // Set default template if templates are available and none selected
    if (!selectedTemplate && formTemplates && formTemplates.length > 0) {
      setSelectedTemplate(formTemplates[0]);
    }
  }, [formTemplates, selectedTemplate]);

  const handleEditStudent = (student) => {
    setEditingStudent(student);
    // Find the template used for this student
    if (student.templateId) {
      const template = formTemplates.find(t => t.id === student.templateId);
      if (template) {
        setSelectedTemplate(template);
      }
    }
    setIsFormVisible(true);
  };

  const handleAddNewClick = () => {
    setEditingStudent(null);
    setIsFormVisible(true);
  };

  const handleFormClose = () => {
    setIsFormVisible(false);
    setEditingStudent(null);
  };

  const handleTemplateChange = (template) => {
    setSelectedTemplate(template);
  };

  const handleViewStudent = (student) => {
    setViewingStudent(student);
    setIsDetailsVisible(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsVisible(false);
    setViewingStudent(null);
  };

  return (
    <div className="student-records">
      <div className="section-header">
        <h2>Student Records</h2>
        <div className="header-actions">
          <FormTemplateSelector 
            templates={formTemplates} 
            selectedTemplate={selectedTemplate}
            onTemplateChange={handleTemplateChange}
          />
          <button 
            className="btn btn-primary" 
            onClick={handleAddNewClick}
            disabled={!selectedTemplate}
          >
            Add New Student
          </button>
        </div>
      </div>

      {isFormVisible && selectedTemplate && (
        <div className="form-container">
          <StudentForm 
            student={editingStudent} 
            template={selectedTemplate}
            onClose={handleFormClose} 
          />
        </div>
      )}

      {isDetailsVisible && viewingStudent && (
        <RecordDetails
          student={viewingStudent}
          onClose={handleCloseDetails}
        />
      )}

      {students.length > 0 ? (
        <StudentList 
          students={students} 
          templates={formTemplates}
          onEdit={handleEditStudent} 
          onView={handleViewStudent}
        />
      ) : (
        <div className="empty-state">
          <p>No student records found. Add your first student to get started.</p>
          <button 
            className="btn" 
            onClick={handleAddNewClick}
            disabled={!selectedTemplate}
          >
            Add Student
          </button>
          {!selectedTemplate && formTemplates.length === 0 && (
            <p className="warning-text">Please create a form template first.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentRecords;