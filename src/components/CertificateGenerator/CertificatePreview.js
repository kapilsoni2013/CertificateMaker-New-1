import React, { useRef, useEffect, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './CertificatePreview.css';

const CertificatePreview = ({ student, template }) => {
  const certificateRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [fontOptions, setFontOptions] = useState({
    color: '#000000',
    size: '16px',
    family: 'Arial'
  });

  // Map student data to template regions
  const mapStudentDataToRegions = () => {
    const dataMap = {
      name: student.name,
      roll_number: student.rollNumber,
      class: student.class
    };

    // Add subject marks to available fields
    if (student.subjects) {
      student.subjects.forEach(subject => {
        const fieldName = `${subject.name.toLowerCase().replace(/\s+/g, '_')}_marks`;
        dataMap[fieldName] = subject.marks;
      });
    }

    return dataMap;
  };

  // Get value for a specific region
  const getValueForRegion = (regionName) => {
    const dataMap = mapStudentDataToRegions();
    const fieldName = regionName.toLowerCase();
    return dataMap[fieldName] !== undefined ? dataMap[fieldName] : '';
  };

  // Handle font color change
  const handleColorChange = (e) => {
    setFontOptions({
      ...fontOptions,
      color: e.target.value
    });
  };

  // Handle font size change
  const handleSizeChange = (e) => {
    setFontOptions({
      ...fontOptions,
      size: e.target.value
    });
  };

  // Handle font family change
  const handleFamilyChange = (e) => {
    setFontOptions({
      ...fontOptions,
      family: e.target.value
    });
  };

  // Download as image
  const downloadAsImage = async () => {
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null
      });
      
      const link = document.createElement('a');
      link.download = `${student.name}_certificate.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Failed to generate image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Download as PDF
  const downloadAsPDF = async () => {
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm'
      });
      
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${student.name}_certificate.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Print certificate
  const printCertificate = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Certificate</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            img {
              max-width: 100%;
              height: auto;
            }
            @media print {
              body {
                margin: 0;
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <img src="${template.imageData}" id="certificate-img" />
          <script>
            const img = document.getElementById('certificate-img');
            img.onload = function() {
              window.print();
              setTimeout(() => window.close(), 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="certificate-preview">
      <h3>Certificate Preview</h3>
      
      <div className="preview-options">
        <div className="form-group">
          <label htmlFor="fontColor" className="form-label">Text Color</label>
          <input
            type="color"
            id="fontColor"
            className="form-control color-input"
            value={fontOptions.color}
            onChange={handleColorChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="fontSize" className="form-label">Font Size</label>
          <select
            id="fontSize"
            className="form-control"
            value={fontOptions.size}
            onChange={handleSizeChange}
          >
            <option value="12px">Small</option>
            <option value="16px">Medium</option>
            <option value="20px">Large</option>
            <option value="24px">X-Large</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="fontFamily" className="form-label">Font Family</label>
          <select
            id="fontFamily"
            className="form-control"
            value={fontOptions.family}
            onChange={handleFamilyChange}
          >
            <option value="Arial">Arial</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Courier New">Courier New</option>
            <option value="Georgia">Georgia</option>
            <option value="Verdana">Verdana</option>
          </select>
        </div>
      </div>
      
      <div className="certificate-container">
        <div className="certificate" ref={certificateRef}>
          <img src={template.imageData} alt="Certificate Template" className="certificate-image" />
          
          {template.regions.map((region, index) => (
            <div
              key={index}
              className="certificate-text"
              style={{
                left: `${region.x}px`,
                top: `${region.y}px`,
                width: `${region.width}px`,
                height: `${region.height}px`,
                color: fontOptions.color,
                fontSize: fontOptions.size,
                fontFamily: fontOptions.family
              }}
            >
              {getValueForRegion(region.name)}
            </div>
          ))}
        </div>
      </div>
      
      <div className="download-options">
        <button 
          className="btn" 
          onClick={downloadAsImage}
          disabled={isGenerating}
        >
          {isGenerating ? 'Generating...' : 'Download as Image'}
        </button>
        
        <button 
          className="btn" 
          onClick={downloadAsPDF}
          disabled={isGenerating}
        >
          {isGenerating ? 'Generating...' : 'Download as PDF'}
        </button>
        
        <button 
          className="btn" 
          onClick={printCertificate}
          disabled={isGenerating}
        >
          Print Certificate
        </button>
      </div>
    </div>
  );
};

export default CertificatePreview;