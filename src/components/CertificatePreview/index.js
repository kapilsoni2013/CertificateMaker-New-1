import React from 'react';
import './CertificatePreview.css';

const CertificatePreview = ({ template, studentData }) => {
  return (
    <div className="certificate-preview-container">
      <h3>Certificate Preview</h3>
      {template ? (
        <div className="preview-content">
          <img src={template.imageUrl} alt="Certificate Template" />
          {/* Overlay student data on the template */}
        </div>
      ) : (
        <p>Please select a template and student data to preview</p>
      )}
    </div>
  );
};

export default CertificatePreview;