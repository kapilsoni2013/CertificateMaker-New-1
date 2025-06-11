import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import StudentForm from './StudentForm';
import StudentList from './StudentList';
import './StudentRecords.css';

const StudentRecords = () => {
  const { students } = useAppContext();
  const [editingStudent, setEditingStudent] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const handleEditStudent = (student) => {
    setEditingStudent(student);
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

  return (
    <div className="student-records">
      <div className="section-header">
        <h2>Student Records</h2>
        <button 
          className="btn btn-primary" 
          onClick={handleAddNewClick}
        >
          Add New Student
        </button>
      </div>

      {isFormVisible && (
        <div className="form-container">
          <StudentForm 
            student={editingStudent} 
            onClose={handleFormClose} 
          />
        </div>
      )}

      {students.length > 0 ? (
        <StudentList 
          students={students} 
          onEdit={handleEditStudent} 
        />
      ) : (
        <div className="empty-state">
          <p>No student records found. Add your first student to get started.</p>
          <button className="btn" onClick={handleAddNewClick}>
            Add Student
          </button>
        </div>
      )}
    </div>
  );
};

export default StudentRecords;