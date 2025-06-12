import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import { v4 as uuidv4 } from 'uuid';

const TemplateEditor = ({ template, onSuccess, onCancel }) => {
  const { updateCertificateTemplate, getAllRegionIdentifiers } = useAppContext();
  
  const [templateData, setTemplateData] = useState(template);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [errors, setErrors] = useState({});
  
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  
  // Available region identifiers from form templates
  const availableIdentifiers = getAllRegionIdentifiers();
  
  // Initialize canvas when component mounts
  useEffect(() => {
    if (template) {
      setTemplateData(template);
      
      // Load the template image
      const img = new Image();
      img.src = template.imageData;
      img.onload = () => {
        imageRef.current = img;
        
        // Calculate scale to fit image in container
        if (containerRef.current) {
          const containerWidth = containerRef.current.clientWidth;
          const imgWidth = img.width;
          
          if (imgWidth > containerWidth) {
            setScale(containerWidth / imgWidth);
          }
        }
        
        drawCanvas();
      };
    }
  }, [template]);
  
  // Draw canvas with template image and regions
  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imageRef.current) return;
    
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;
    
    // Set canvas dimensions to match image
    canvas.width = img.width;
    canvas.height = img.height;
    
    // Draw image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    
    // Draw temporary region if drawing
    if (isDrawing) {
      const width = currentPos.x - startPos.x;
      const height = currentPos.y - startPos.y;
      
      ctx.strokeStyle = 'rgba(0, 123, 255, 0.7)';
      ctx.lineWidth = 2;
      ctx.strokeRect(startPos.x, startPos.y, width, height);
      ctx.fillStyle = 'rgba(0, 123, 255, 0.1)';
      ctx.fillRect(startPos.x, startPos.y, width, height);
    }
  };
  
  // Handle mouse down on canvas
  const handleMouseDown = (e) => {
    if (selectedRegion) {
      setSelectedRegion(null);
      return;
    }
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    
    setIsDrawing(true);
    setStartPos({ x, y });
    setCurrentPos({ x, y });
  };
  
  // Handle mouse move on canvas
  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    
    setCurrentPos({ x, y });
    drawCanvas();
  };
  
  // Handle mouse up on canvas
  const handleMouseUp = () => {
    if (!isDrawing) return;
    
    setIsDrawing(false);
    
    // Calculate region dimensions
    const x = Math.min(startPos.x, currentPos.x);
    const y = Math.min(startPos.y, currentPos.y);
    const width = Math.abs(currentPos.x - startPos.x);
    const height = Math.abs(currentPos.y - startPos.y);
    
    // Add new region if dimensions are valid
    if (width > 10 && height > 10) {
      const newRegion = {
        id: uuidv4(),
        x,
        y,
        width,
        height,
        region_identifier: '',
        formatting: {
          fontSize: 16,
          color: '#000000',
          alignment: 'center'
        }
      };
      
      setTemplateData({
        ...templateData,
        regions: [...templateData.regions, newRegion]
      });
      
      setSelectedRegion(newRegion);
    }
    
    drawCanvas();
  };
  
  // Handle region selection
  const handleRegionSelect = (region) => {
    setSelectedRegion(region);
  };
  
  // Handle region deletion
  const handleRegionDelete = (id) => {
    setTemplateData({
      ...templateData,
      regions: templateData.regions.filter(region => region.id !== id)
    });
    
    if (selectedRegion && selectedRegion.id === id) {
      setSelectedRegion(null);
    }
  };
  
  // Handle region identifier change
  const handleRegionIdentifierChange = (e) => {
    const { value } = e.target;
    
    if (selectedRegion) {
      const updatedRegion = {
        ...selectedRegion,
        region_identifier: value
      };
      
      setSelectedRegion(updatedRegion);
      
      setTemplateData({
        ...templateData,
        regions: templateData.regions.map(region => 
          region.id === selectedRegion.id ? updatedRegion : region
        )
      });
    }
  };
  
  // Handle formatting change
  const handleFormattingChange = (property, value) => {
    if (selectedRegion) {
      const updatedRegion = {
        ...selectedRegion,
        formatting: {
          ...selectedRegion.formatting,
          [property]: value
        }
      };
      
      setSelectedRegion(updatedRegion);
      
      setTemplateData({
        ...templateData,
        regions: templateData.regions.map(region => 
          region.id === selectedRegion.id ? updatedRegion : region
        )
      });
    }
  };
  
  // Validate form before submission
  const validateForm = () => {
    const newErrors = {};
    
    // Check if all regions have identifiers
    const regionsWithoutIdentifiers = templateData.regions.filter(
      region => !region.region_identifier
    );
    
    if (regionsWithoutIdentifiers.length > 0) {
      newErrors.regions = 'All regions must have an identifier';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      updateCertificateTemplate(templateData.id, templateData);
      onSuccess();
    }
  };
  
  // Get region style for display
  const getRegionStyle = (region) => {
    const isSelected = selectedRegion && selectedRegion.id === region.id;
    
    return {
      left: `${region.x * scale}px`,
      top: `${region.y * scale}px`,
      width: `${region.width * scale}px`,
      height: `${region.height * scale}px`,
      borderColor: isSelected ? 'rgba(255, 193, 7, 0.8)' : 'rgba(0, 123, 255, 0.7)',
      backgroundColor: isSelected ? 'rgba(255, 193, 7, 0.2)' : 'rgba(0, 123, 255, 0.1)'
    };
  };
  
  return (
    <div className="template-editor">
      <h3>Edit Certificate Template: {templateData.name}</h3>
      
      <div className="canvas-instructions">
        <h4>Instructions</h4>
        <ul>
          <li>Click and drag on the template to create a new region</li>
          <li>Click on a region to select it and edit its properties</li>
          <li>Each region must be assigned a region identifier from your form templates</li>
        </ul>
      </div>
      
      <div className="canvas-container" ref={containerRef}>
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
        />
        
        {templateData.regions.map(region => (
          <div
            key={region.id}
            className="region"
            style={getRegionStyle(region)}
            onClick={() => handleRegionSelect(region)}
          >
            {region.region_identifier && (
              <div className="region-label">
                {region.region_identifier}
              </div>
            )}
            <div className="region-actions">
              <button
                className="region-action-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRegionDelete(region.id);
                }}
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {errors.regions && <div className="error">{errors.regions}</div>}
      
      {selectedRegion && (
        <div className="region-form">
          <h4>Region Properties</h4>
          
          <div className="form-control">
            <label htmlFor="region_identifier">Region Identifier</label>
            <select
              id="region_identifier"
              value={selectedRegion.region_identifier}
              onChange={handleRegionIdentifierChange}
            >
              <option value="">-- Select Region Identifier --</option>
              {availableIdentifiers.map(identifier => (
                <option key={identifier} value={identifier}>
                  {identifier}
                </option>
              ))}
            </select>
            <small>
              This identifier will be used to map data from form fields to this region.
            </small>
          </div>
          
          <div className="form-control">
            <label htmlFor="fontSize">Font Size (px)</label>
            <input
              type="number"
              id="fontSize"
              value={selectedRegion.formatting.fontSize}
              onChange={(e) => handleFormattingChange('fontSize', parseInt(e.target.value))}
              min="8"
              max="72"
            />
          </div>
          
          <div className="form-control">
            <label htmlFor="color">Text Color</label>
            <input
              type="color"
              id="color"
              value={selectedRegion.formatting.color}
              onChange={(e) => handleFormattingChange('color', e.target.value)}
            />
          </div>
          
          <div className="form-control">
            <label htmlFor="alignment">Text Alignment</label>
            <select
              id="alignment"
              value={selectedRegion.formatting.alignment}
              onChange={(e) => handleFormattingChange('alignment', e.target.value)}
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
        </div>
      )}
      
      <div className="region-list">
        <h4>Mapped Regions ({templateData.regions.length})</h4>
        
        {templateData.regions.length === 0 ? (
          <p>No regions mapped yet. Click and drag on the template to create regions.</p>
        ) : (
          templateData.regions.map(region => (
            <div
              key={region.id}
              className="region-item"
              onClick={() => handleRegionSelect(region)}
            >
              <div className="region-item-info">
                <div className="region-item-name">
                  {region.region_identifier || 'Unnamed Region'}
                </div>
                <div className="region-item-coords">
                  X: {Math.round(region.x)}, Y: {Math.round(region.y)}, 
                  Width: {Math.round(region.width)}, Height: {Math.round(region.height)}
                </div>
              </div>
              <div className="region-item-actions">
                <button
                  className="btn btn-danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRegionDelete(region.id);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="form-actions">
        <button
          className="btn btn-success"
          onClick={handleSubmit}
        >
          Save Template
        </button>
        <button
          className="btn"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default TemplateEditor;