import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import './TemplateEditor.css';

const TemplateEditor = ({ template, onClose }) => {
  const { updateTemplate } = useAppContext();
  const [regions, setRegions] = useState(template.regions || []);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentRegion, setCurrentRegion] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [regionName, setRegionName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);
  const [errors, setErrors] = useState({});
  
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  
  // Load the template image
  useEffect(() => {
    const image = new Image();
    image.src = template.imageData;
    image.onload = () => {
      imageRef.current = image;
      drawCanvas();
    };
  }, [template.imageData]);
  
  // Draw the canvas with image and regions
  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (imageRef.current) {
      // Set canvas dimensions to match image
      canvas.width = imageRef.current.width;
      canvas.height = imageRef.current.height;
      
      // Draw the image
      ctx.drawImage(imageRef.current, 0, 0);
      
      // Draw all regions
      regions.forEach((region, index) => {
        const isSelected = selectedRegion === index;
        
        // Draw rectangle
        ctx.strokeStyle = isSelected ? '#e74c3c' : '#3498db';
        ctx.lineWidth = isSelected ? 3 : 2;
        ctx.strokeRect(region.x, region.y, region.width, region.height);
        
        // Add semi-transparent fill
        ctx.fillStyle = isSelected ? 'rgba(231, 76, 60, 0.2)' : 'rgba(52, 152, 219, 0.1)';
        ctx.fillRect(region.x, region.y, region.width, region.height);
        
        // Add label
        ctx.fillStyle = isSelected ? '#e74c3c' : '#3498db';
        ctx.font = '14px Arial';
        ctx.fillText(region.name, region.x + 5, region.y + 20);
      });
      
      // Draw current region being created
      if (currentRegion) {
        ctx.strokeStyle = '#2ecc71';
        ctx.lineWidth = 2;
        ctx.strokeRect(
          currentRegion.x, 
          currentRegion.y, 
          currentRegion.width, 
          currentRegion.height
        );
        
        ctx.fillStyle = 'rgba(46, 204, 113, 0.1)';
        ctx.fillRect(
          currentRegion.x, 
          currentRegion.y, 
          currentRegion.width, 
          currentRegion.height
        );
      }
    }
  };
  
  // Handle mouse down event
  const handleMouseDown = (e) => {
    if (showNameInput) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    // Check if clicked on an existing region
    let regionIndex = -1;
    for (let i = regions.length - 1; i >= 0; i--) {
      const region = regions[i];
      if (
        x >= region.x && 
        x <= region.x + region.width && 
        y >= region.y && 
        y <= region.y + region.height
      ) {
        regionIndex = i;
        break;
      }
    }
    
    if (regionIndex !== -1) {
      // Clicked on an existing region
      setSelectedRegion(regionIndex);
    } else {
      // Start drawing a new region
      setIsDrawing(true);
      setCurrentRegion({
        x,
        y,
        width: 0,
        height: 0
      });
      setSelectedRegion(null);
    }
  };
  
  // Handle mouse move event
  const handleMouseMove = (e) => {
    if (!isDrawing || showNameInput) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    setCurrentRegion(prev => ({
      ...prev,
      width: x - prev.x,
      height: y - prev.y
    }));
    
    drawCanvas();
  };
  
  // Handle mouse up event
  const handleMouseUp = () => {
    if (!isDrawing || showNameInput) return;
    
    setIsDrawing(false);
    
    // Only add region if it has some size
    if (
      currentRegion && 
      (Math.abs(currentRegion.width) > 10 && Math.abs(currentRegion.height) > 10)
    ) {
      // Normalize negative width/height
      const normalizedRegion = {
        x: currentRegion.width < 0 ? currentRegion.x + currentRegion.width : currentRegion.x,
        y: currentRegion.height < 0 ? currentRegion.y + currentRegion.height : currentRegion.y,
        width: Math.abs(currentRegion.width),
        height: Math.abs(currentRegion.height)
      };
      
      setCurrentRegion(normalizedRegion);
      setShowNameInput(true);
    } else {
      setCurrentRegion(null);
    }
    
    drawCanvas();
  };
  
  // Handle region name input
  const handleNameChange = (e) => {
    setRegionName(e.target.value);
    setErrors({});
  };
  
  // Add the new region
  const addRegion = () => {
    if (!regionName.trim()) {
      setErrors({ name: 'Region name is required' });
      return;
    }
    
    const newRegion = {
      ...currentRegion,
      name: regionName.trim()
    };
    
    setRegions([...regions, newRegion]);
    setCurrentRegion(null);
    setRegionName('');
    setShowNameInput(false);
    drawCanvas();
  };
  
  // Delete selected region
  const deleteSelectedRegion = () => {
    if (selectedRegion !== null) {
      const updatedRegions = regions.filter((_, index) => index !== selectedRegion);
      setRegions(updatedRegions);
      setSelectedRegion(null);
      drawCanvas();
    }
  };
  
  // Cancel adding new region
  const cancelAddRegion = () => {
    setCurrentRegion(null);
    setRegionName('');
    setShowNameInput(false);
    drawCanvas();
  };
  
  // Save template with regions
  const saveTemplate = () => {
    const updatedTemplate = {
      ...template,
      regions: regions
    };
    
    updateTemplate(updatedTemplate);
    onClose();
  };
  
  // Update canvas when regions change
  useEffect(() => {
    drawCanvas();
  }, [regions, selectedRegion]);
  
  return (
    <div className="template-editor card">
      <div className="editor-header">
        <h3>Edit Template Regions: {template.name}</h3>
        <div className="editor-instructions">
          <p>Click and drag on the template to create regions for student data.</p>
          <p>Click on a region to select it. Press Delete key or the Delete button to remove a selected region.</p>
        </div>
      </div>
      
      <div className="editor-content">
        <div className="canvas-container" ref={containerRef}>
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
          
          {showNameInput && (
            <div className="region-name-input">
              <h4>Name this region</h4>
              <p className="hint">Use field names like: name, roll_number, class, math_marks, etc.</p>
              <input
                type="text"
                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                value={regionName}
                onChange={handleNameChange}
                placeholder="Enter region name"
                autoFocus
              />
              {errors.name && <div className="error-message">{errors.name}</div>}
              <div className="input-actions">
                <button className="btn btn-secondary" onClick={cancelAddRegion}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={addRegion}>
                  Add Region
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="regions-sidebar">
          <h4>Template Regions</h4>
          
          {regions.length > 0 ? (
            <div className="regions-list">
              {regions.map((region, index) => (
                <div 
                  key={index} 
                  className={`region-item ${selectedRegion === index ? 'selected' : ''}`}
                  onClick={() => setSelectedRegion(index)}
                >
                  <span className="region-name">{region.name}</span>
                  <span className="region-coords">
                    ({Math.round(region.x)}, {Math.round(region.y)}) - {Math.round(region.width)}×{Math.round(region.height)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-regions">No regions defined yet. Click and drag on the template to create regions.</p>
          )}
          
          {selectedRegion !== null && (
            <button 
              className="btn btn-danger btn-sm" 
              onClick={deleteSelectedRegion}
            >
              Delete Selected Region
            </button>
          )}
        </div>
      </div>
      
      <div className="editor-actions">
        <button className="btn btn-secondary" onClick={onClose}>
          Cancel
        </button>
        <button className="btn btn-primary" onClick={saveTemplate}>
          Save Template
        </button>
      </div>
    </div>
  );
};

export default TemplateEditor;