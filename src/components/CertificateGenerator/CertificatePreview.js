import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const CertificatePreview = ({ certificateTemplate, formTemplate, studentRecord, studentRecords, batchMode = false, showAlert }) => {
  const [previewImages, setPreviewImages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef(null);
  
  // Generate certificate preview
  useEffect(() => {
    if (batchMode && studentRecords) {
      generateBatchPreviews();
    } else if (!batchMode && studentRecord) {
      generateSinglePreview();
    }
  }, [certificateTemplate, formTemplate, studentRecord, studentRecords, batchMode]);
  
  // Generate a single certificate preview
  const generateSinglePreview = async () => {
    setIsGenerating(true);
    
    try {
      const previewImage = await generateCertificateImage(studentRecord);
      setPreviewImages([{ record: studentRecord, image: previewImage }]);
    } catch (error) {
      console.error('Error generating certificate preview:', error);
      showAlert('danger', 'Error generating certificate preview');
    }
    
    setIsGenerating(false);
  };
  
  // Generate batch certificate previews
  const generateBatchPreviews = async () => {
    setIsGenerating(true);
    
    try {
      const previews = [];
      
      // Generate preview for first record only (for display)
      if (studentRecords.length > 0) {
        const previewImage = await generateCertificateImage(studentRecords[0]);
        previews.push({ record: studentRecords[0], image: previewImage });
      }
      
      setPreviewImages(previews);
    } catch (error) {
      console.error('Error generating batch certificate previews:', error);
      showAlert('danger', 'Error generating batch certificate previews');
    }
    
    setIsGenerating(false);
  };
  
  // Generate certificate image for a student record
  const generateCertificateImage = (record) => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Load template image
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = certificateTemplate.imageData;
      
      img.onload = () => {
        // Set canvas dimensions to match image
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw template image
        ctx.drawImage(img, 0, 0);
        
        // Draw text for each region
        certificateTemplate.regions.forEach(region => {
          const fieldId = getFieldIdByRegionIdentifier(region.region_identifier);
          if (fieldId) {
            const value = record.data[fieldId] || '';
            
            // Format value based on field type
            const field = formTemplate.fields.find(f => f.id === fieldId);
            let displayValue = value;
            
            if (field && field.type === 'select') {
              const option = field.options.find(opt => opt.value === value);
              displayValue = option ? option.label : value;
            }
            
            // Apply text formatting
            ctx.font = `${region.formatting.fontSize}px Arial`;
            ctx.fillStyle = region.formatting.color;
            ctx.textAlign = region.formatting.alignment;
            
            // Calculate text position based on alignment
            let x = region.x;
            if (region.formatting.alignment === 'center') {
              x = region.x + region.width / 2;
            } else if (region.formatting.alignment === 'right') {
              x = region.x + region.width;
            }
            
            // Draw text centered vertically in the region
            const textHeight = region.formatting.fontSize;
            const y = region.y + (region.height / 2) + (textHeight / 3); // Approximate vertical centering
            
            ctx.fillText(displayValue, x, y);
          }
        });
        
        // Convert canvas to image data URL
        const imageData = canvas.toDataURL('image/png');
        resolve(imageData);
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load template image'));
      };
    });
  };
  
  // Get field ID by region identifier
  const getFieldIdByRegionIdentifier = (regionIdentifier) => {
    const field = formTemplate.fields.find(f => f.region_identifier === regionIdentifier);
    return field ? field.id : null;
  };
  
  // Download certificate as image
  const downloadAsImage = (index = 0) => {
    if (previewImages.length === 0) return;
    
    const link = document.createElement('a');
    
    if (batchMode) {
      // For batch mode, generate all certificates and download as zip
      downloadBatchCertificates();
    } else {
      // For single mode, download the current preview
      const image = previewImages[index].image;
      const record = previewImages[index].record;
      
      // Get a display name from the first field
      const firstField = formTemplate.fields[0];
      const displayValue = record.data[firstField.id] || 'certificate';
      const fileName = `${displayValue}_certificate.png`;
      
      link.href = image;
      link.download = fileName;
      link.click();
    }
  };
  
  // Download certificate as PDF
  const downloadAsPDF = (index = 0) => {
    if (previewImages.length === 0) return;
    
    if (batchMode) {
      // For batch mode, generate all certificates and download as PDF
      downloadBatchPDF();
    } else {
      // For single mode, download the current preview as PDF
      const image = previewImages[index].image;
      const record = previewImages[index].record;
      
      // Get a display name from the first field
      const firstField = formTemplate.fields[0];
      const displayValue = record.data[firstField.id] || 'certificate';
      const fileName = `${displayValue}_certificate.pdf`;
      
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px'
      });
      
      // Load image to get dimensions
      const img = new Image();
      img.src = image;
      
      img.onload = () => {
        // Calculate PDF dimensions to fit the image
        const imgWidth = img.width;
        const imgHeight = img.height;
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        // Scale image to fit PDF page
        const scale = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        const scaledWidth = imgWidth * scale;
        const scaledHeight = imgHeight * scale;
        
        // Center image on page
        const x = (pdfWidth - scaledWidth) / 2;
        const y = (pdfHeight - scaledHeight) / 2;
        
        pdf.addImage(image, 'PNG', x, y, scaledWidth, scaledHeight);
        pdf.save(fileName);
      };
    }
  };
  
  // Download batch certificates as images
  const downloadBatchCertificates = async () => {
    if (!studentRecords || studentRecords.length === 0) return;
    
    setIsGenerating(true);
    showAlert('info', 'Generating certificates. Please wait...');
    
    try {
      // Generate certificates for all records
      for (const record of studentRecords) {
        const image = await generateCertificateImage(record);
        
        // Get a display name from the first field
        const firstField = formTemplate.fields[0];
        const displayValue = record.data[firstField.id] || 'certificate';
        const fileName = `${displayValue}_certificate.png`;
        
        // Create download link
        const link = document.createElement('a');
        link.href = image;
        link.download = fileName;
        link.click();
        
        // Add a small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      showAlert('success', `Generated ${studentRecords.length} certificates successfully!`);
    } catch (error) {
      console.error('Error generating batch certificates:', error);
      showAlert('danger', 'Error generating batch certificates');
    }
    
    setIsGenerating(false);
  };
  
  // Download batch certificates as PDF
  const downloadBatchPDF = async () => {
    if (!studentRecords || studentRecords.length === 0) return;
    
    setIsGenerating(true);
    showAlert('info', 'Generating PDF. Please wait...');
    
    try {
      // Create PDF document
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px'
      });
      
      // Generate certificates for all records
      for (let i = 0; i < studentRecords.length; i++) {
        const record = studentRecords[i];
        const image = await generateCertificateImage(record);
        
        // Add new page for each certificate except the first one
        if (i > 0) {
          pdf.addPage();
        }
        
        // Load image to get dimensions
        const img = new Image();
        img.src = image;
        
        // Wait for image to load
        await new Promise(resolve => {
          img.onload = resolve;
        });
        
        // Calculate PDF dimensions to fit the image
        const imgWidth = img.width;
        const imgHeight = img.height;
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        // Scale image to fit PDF page
        const scale = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        const scaledWidth = imgWidth * scale;
        const scaledHeight = imgHeight * scale;
        
        // Center image on page
        const x = (pdfWidth - scaledWidth) / 2;
        const y = (pdfHeight - scaledHeight) / 2;
        
        pdf.addImage(image, 'PNG', x, y, scaledWidth, scaledHeight);
      }
      
      // Save PDF
      pdf.save(`${certificateTemplate.name}_certificates.pdf`);
      showAlert('success', `Generated PDF with ${studentRecords.length} certificates successfully!`);
    } catch (error) {
      console.error('Error generating batch PDF:', error);
      showAlert('danger', 'Error generating batch PDF');
    }
    
    setIsGenerating(false);
  };
  
  // Print certificate
  const printCertificate = () => {
    if (previewImages.length === 0) return;
    
    const printWindow = window.open('', '_blank');
    
    if (batchMode) {
      // For batch mode, print all certificates
      printBatchCertificates(printWindow);
    } else {
      // For single mode, print the current preview
      const image = previewImages[0].image;
      
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
                max-height: 100vh;
              }
              @media print {
                @page {
                  size: landscape;
                  margin: 0;
                }
                body {
                  margin: 0;
                }
              }
            </style>
          </head>
          <body>
            <img src="${image}" />
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                  window.close();
                }, 500);
              };
            </script>
          </body>
        </html>
      `);
      
      printWindow.document.close();
    }
  };
  
  // Print batch certificates
  const printBatchCertificates = async (printWindow) => {
    if (!studentRecords || studentRecords.length === 0) return;
    
    setIsGenerating(true);
    showAlert('info', 'Preparing certificates for printing. Please wait...');
    
    try {
      // Generate certificates for all records
      const images = [];
      
      for (const record of studentRecords) {
        const image = await generateCertificateImage(record);
        images.push(image);
      }
      
      // Create HTML for printing
      let html = `
        <html>
          <head>
            <title>Print Certificates</title>
            <style>
              body {
                margin: 0;
                padding: 0;
              }
              .certificate-page {
                width: 100%;
                height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
                page-break-after: always;
              }
              .certificate-page:last-child {
                page-break-after: auto;
              }
              img {
                max-width: 100%;
                max-height: 100vh;
              }
              @media print {
                @page {
                  size: landscape;
                  margin: 0;
                }
                body {
                  margin: 0;
                }
              }
            </style>
          </head>
          <body>
      `;
      
      // Add each certificate as a page
      images.forEach(image => {
        html += `
          <div class="certificate-page">
            <img src="${image}" />
          </div>
        `;
      });
      
      html += `
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                  window.close();
                }, 1000);
              };
            </script>
          </body>
        </html>
      `;
      
      printWindow.document.write(html);
      printWindow.document.close();
      
      showAlert('success', `Prepared ${studentRecords.length} certificates for printing!`);
    } catch (error) {
      console.error('Error preparing batch certificates for printing:', error);
      showAlert('danger', 'Error preparing certificates for printing');
      printWindow.close();
    }
    
    setIsGenerating(false);
  };
  
  return (
    <div className="certificate-preview">
      <h3>
        {batchMode
          ? `Batch Certificate Generation (${studentRecords.length} records)`
          : 'Certificate Preview'}
      </h3>
      
      {isGenerating ? (
        <div className="loading">Generating certificate preview...</div>
      ) : previewImages.length > 0 ? (
        <>
          <div className="preview-canvas-container">
            <img
              ref={canvasRef}
              src={previewImages[0].image}
              alt="Certificate Preview"
              className="preview-canvas"
            />
          </div>
          
          <div className="download-options">
            <h4>Download Options</h4>
            <div className="download-buttons">
              <button
                className="btn"
                onClick={() => downloadAsImage()}
                disabled={isGenerating}
              >
                {batchMode ? 'Download All as Images' : 'Download as Image'}
              </button>
              <button
                className="btn"
                onClick={() => downloadAsPDF()}
                disabled={isGenerating}
              >
                {batchMode ? 'Download All as PDF' : 'Download as PDF'}
              </button>
              <button
                className="btn"
                onClick={printCertificate}
                disabled={isGenerating}
              >
                {batchMode ? 'Print All Certificates' : 'Print Certificate'}
              </button>
            </div>
          </div>
          
          {batchMode && (
            <div className="batch-preview-info">
              <p>
                <strong>Note:</strong> Only showing preview for the first record.
                Batch download will generate certificates for all {studentRecords.length} selected records.
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="no-preview">
          <p>No preview available.</p>
        </div>
      )}
    </div>
  );
};

export default CertificatePreview;