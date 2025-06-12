import React from 'react';
import './CertificatePreview.css';

const CertificatePreview = ({ template, studentData }) => {
  const renderStudentData = () => {
    if (!studentData || Object.keys(studentData).length === 0) {
      return null;
    }

    return (
      <div className="student-data-overlay">
        {Object.entries(studentData).map(([key, value]) => (
          <div key={key} className="student-field" data-field={key}>
            {value}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="certificate-preview-container">
      <h3>Certificate Preview</h3>
      {template ? (
        <div className="preview-content">
          <div className="template-container">
            <img src={template.imageUrl} alt="Certificate Template" />
            {renderStudentData()}
          </div>
        </div>
      ) : (
        <p>Please select a template and student data to preview</p>
      )}
    </div>
  );
};

export default CertificatePreview;