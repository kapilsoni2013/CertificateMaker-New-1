import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import './StudentList.css';

const StudentList = ({ students, onEdit }) => {
  const { deleteStudent } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Filter students based on search term
  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.class.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteClick = (studentId) => {
    setConfirmDelete(studentId);
  };

  const confirmDeleteStudent = () => {
    if (confirmDelete) {
      deleteStudent(confirmDelete);
      setConfirmDelete(null);
    }
  };

  const cancelDelete = () => {
    setConfirmDelete(null);
  };

  return (
    <div className="student-list-container card">
      <div className="list-header">
        <h3>Student Records</h3>
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredStudents.length > 0 ? (
        <div className="table-responsive">
          <table className="student-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Roll Number</th>
                <th>Class/Grade</th>
                <th>Subjects</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(student => (
                <tr key={student.id}>
                  <td>{student.name}</td>
                  <td>{student.rollNumber}</td>
                  <td>{student.class}</td>
                  <td>
                    <ul className="subjects-list">
                      {student.subjects && student.subjects.map((subject, index) => (
                        <li key={index}>
                          {subject.name}: {subject.marks}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn btn-sm" 
                        onClick={() => onEdit(student)}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn btn-danger btn-sm" 
                        onClick={() => handleDeleteClick(student.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="no-results">
          <p>No students found matching your search.</p>
        </div>
      )}

      {confirmDelete && (
        <div className="delete-confirmation-modal">
          <div className="modal-content">
            <h4>Confirm Delete</h4>
            <p>Are you sure you want to delete this student record? This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={cancelDelete}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={confirmDeleteStudent}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentList;