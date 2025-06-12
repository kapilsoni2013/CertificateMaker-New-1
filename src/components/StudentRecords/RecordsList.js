import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';

const RecordsList = ({ records, formTemplate, onView, onEdit, showAlert }) => {
  const { deleteStudentRecord } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Handle record deletion
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      deleteStudentRecord(id);
      showAlert('success', 'Record deleted successfully!');
    }
  };
  
  // Filter records based on search term
  const filteredRecords = records.filter(record => {
    const searchString = searchTerm.toLowerCase();
    
    // Search in all field values
    return Object.values(record.data).some(value => 
      value.toString().toLowerCase().includes(searchString)
    );
  });
  
  // Get display fields (first 3 fields for table display)
  const getDisplayFields = () => {
    if (!formTemplate || !formTemplate.fields) return [];
    return formTemplate.fields.slice(0, 3);
  };
  
  // Get field value for display
  const getFieldValue = (record, fieldId) => {
    const field = formTemplate.fields.find(f => f.id === fieldId);
    if (!field) return '';
    
    const value = record.data[field.id];
    
    // Format value based on field type
    if (field.type === 'select') {
      const option = field.options.find(opt => opt.value === value);
      return option ? option.label : value;
    }
    
    return value || '';
  };
  
  if (records.length === 0) {
    return (
      <div className="no-records">
        <p>No records found for this form template.</p>
      </div>
    );
  }
  
  const displayFields = getDisplayFields();
  
  return (
    <div className="records-list">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search records..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <table className="records-table">
        <thead>
          <tr>
            {displayFields.map(field => (
              <th key={field.id}>{field.label}</th>
            ))}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredRecords.map(record => (
            <tr key={record.id}>
              {displayFields.map(field => (
                <td key={field.id}>{getFieldValue(record, field.id)}</td>
              ))}
              <td className="record-actions-cell">
                <button
                  className="btn"
                  onClick={() => onView(record)}
                >
                  View
                </button>
                <button
                  className="btn"
                  onClick={() => onEdit(record)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(record.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecordsList;