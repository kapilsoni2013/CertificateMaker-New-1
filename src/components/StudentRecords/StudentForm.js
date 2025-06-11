import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import './StudentForm.css';

const StudentForm = ({ student, onClose }) => {
  const { addStudent, updateStudent } = useAppContext();
  const [formData, setFormData] = useState({
    name: '',
    rollNumber: '',
    class: '',
    subjects: [{ name: '', marks: '' }]
  });
  const [errors, setErrors] = useState({});

  // If editing an existing student, populate the form
  useEffect(() => {
    if (student) {
      setFormData({
        ...student,
        // Ensure subjects is an array with at least one item
        subjects: student.subjects && student.subjects.length > 0 
          ? student.subjects 
          : [{ name: '', marks: '' }]
      });
    }
  }, [student]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Student name is required';
    }
    
    if (!formData.rollNumber.trim()) {
      newErrors.rollNumber = 'Roll number is required';
    }
    
    if (!formData.class.trim()) {
      newErrors.class = 'Class/Grade is required';
    }
    
    // Validate subjects
    const subjectErrors = [];
    let hasSubjectError = false;
    
    formData.subjects.forEach((subject, index) => {
      const subjectError = {};
      
      if (!subject.name.trim()) {
        subjectError.name = 'Subject name is required';
        hasSubjectError = true;
      }
      
      if (subject.marks === '' || isNaN(subject.marks)) {
        subjectError.marks = 'Valid marks are required';
        hasSubjectError = true;
      } else if (Number(subject.marks) < 0 || Number(subject.marks) > 100) {
        subjectError.marks = 'Marks must be between 0 and 100';
        hasSubjectError = true;
      }
      
      subjectErrors[index] = subjectError;
    });
    
    if (hasSubjectError) {
      newErrors.subjects = subjectErrors;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubjectChange = (index, field, value) => {
    const updatedSubjects = [...formData.subjects];
    updatedSubjects[index] = {
      ...updatedSubjects[index],
      [field]: field === 'marks' ? value : value
    };
    
    setFormData({
      ...formData,
      subjects: updatedSubjects
    });
  };

  const addSubject = () => {
    setFormData({
      ...formData,
      subjects: [...formData.subjects, { name: '', marks: '' }]
    });
  };

  const removeSubject = (index) => {
    if (formData.subjects.length > 1) {
      const updatedSubjects = formData.subjects.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        subjects: updatedSubjects
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Process the form data
      const studentData = {
        ...formData,
        subjects: formData.subjects.map(subject => ({
          name: subject.name,
          marks: Number(subject.marks)
        }))
      };
      
      if (student) {
        // Update existing student
        updateStudent(studentData);
      } else {
        // Add new student
        addStudent(studentData);
      }
      
      onClose();
    }
  };

  return (
    <div className="student-form-container card">
      <h3>{student ? 'Edit Student' : 'Add New Student'}</h3>
      
      <form onSubmit={handleSubmit} className="student-form">
        <div className="form-group">
          <label htmlFor="name" className="form-label">Student Name</label>
          <input
            type="text"
            id="name"
            name="name"
            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter student name"
          />
          {errors.name && <div className="error-message">{errors.name}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="rollNumber" className="form-label">Roll Number</label>
          <input
            type="text"
            id="rollNumber"
            name="rollNumber"
            className={`form-control ${errors.rollNumber ? 'is-invalid' : ''}`}
            value={formData.rollNumber}
            onChange={handleChange}
            placeholder="Enter roll number"
          />
          {errors.rollNumber && <div className="error-message">{errors.rollNumber}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="class" className="form-label">Class/Grade</label>
          <input
            type="text"
            id="class"
            name="class"
            className={`form-control ${errors.class ? 'is-invalid' : ''}`}
            value={formData.class}
            onChange={handleChange}
            placeholder="Enter class or grade"
          />
          {errors.class && <div className="error-message">{errors.class}</div>}
        </div>
        
        <div className="subjects-section">
          <div className="subjects-header">
            <h4>Subjects</h4>
            <button 
              type="button" 
              className="btn btn-sm" 
              onClick={addSubject}
            >
              Add Subject
            </button>
          </div>
          
          {formData.subjects.map((subject, index) => (
            <div key={index} className="subject-row">
              <div className="subject-inputs">
                <div className="form-group">
                  <input
                    type="text"
                    className={`form-control ${errors.subjects && errors.subjects[index]?.name ? 'is-invalid' : ''}`}
                    value={subject.name}
                    onChange={(e) => handleSubjectChange(index, 'name', e.target.value)}
                    placeholder="Subject name"
                  />
                  {errors.subjects && errors.subjects[index]?.name && (
                    <div className="error-message">{errors.subjects[index].name}</div>
                  )}
                </div>
                
                <div className="form-group">
                  <input
                    type="number"
                    className={`form-control ${errors.subjects && errors.subjects[index]?.marks ? 'is-invalid' : ''}`}
                    value={subject.marks}
                    onChange={(e) => handleSubjectChange(index, 'marks', e.target.value)}
                    placeholder="Marks"
                    min="0"
                    max="100"
                  />
                  {errors.subjects && errors.subjects[index]?.marks && (
                    <div className="error-message">{errors.subjects[index].marks}</div>
                  )}
                </div>
              </div>
              
              {formData.subjects.length > 1 && (
                <button 
                  type="button" 
                  className="btn btn-danger btn-sm" 
                  onClick={() => removeSubject(index)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
        
        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {student ? 'Update Student' : 'Add Student'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentForm;