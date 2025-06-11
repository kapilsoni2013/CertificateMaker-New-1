import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for canvas operations
 * @param {string} imageUrl - URL of the image to draw on canvas
 * @param {Array} regions - Array of regions to draw
 * @returns {Object} Canvas state and handlers
 */
const useCanvas = (imageUrl, initialRegions = []) => {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const [regions, setRegions] = useState(initialRegions);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentRegion, setCurrentRegion] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [canvasReady, setCanvasReady] = useState(false);

  // Load the image
  useEffect(() => {
    if (!imageUrl) return;

    const image = new Image();
    image.src = imageUrl;
    image.onload = () => {
      imageRef.current = image;
      setCanvasReady(true);
    };
  }, [imageUrl]);

  // Draw the canvas
  const drawCanvas = () => {
    if (!canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
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
      ctx.fillText(region.name || 'Unnamed', region.x + 5, region.y + 20);
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
  };

  // Update canvas when dependencies change
  useEffect(() => {
    if (canvasReady) {
      drawCanvas();
    }
  }, [canvasReady, regions, selectedRegion, currentRegion]);

  // Get mouse position relative to canvas
  const getMousePos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  // Handle mouse down event
  const handleMouseDown = (e) => {
    const pos = getMousePos(e);
    
    // Check if clicked on an existing region
    let regionIndex = -1;
    for (let i = regions.length - 1; i >= 0; i--) {
      const region = regions[i];
      if (
        pos.x >= region.x && 
        pos.x <= region.x + region.width && 
        pos.y >= region.y && 
        pos.y <= region.y + region.height
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
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0
      });
      setSelectedRegion(null);
    }
  };

  // Handle mouse move event
  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    
    const pos = getMousePos(e);
    
    setCurrentRegion(prev => ({
      ...prev,
      width: pos.x - prev.x,
      height: pos.y - prev.y
    }));
  };

  // Handle mouse up event
  const handleMouseUp = () => {
    if (!isDrawing) return;
    
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
      return normalizedRegion;
    }
    
    setCurrentRegion(null);
    return null;
  };

  // Add a new region
  const addRegion = (region, name) => {
    if (!region) return;
    
    const newRegion = {
      ...region,
      name: name || 'Unnamed'
    };
    
    setRegions([...regions, newRegion]);
    setCurrentRegion(null);
    return newRegion;
  };

  // Delete a region
  const deleteRegion = (index) => {
    if (index === null || index === undefined) return;
    
    const updatedRegions = regions.filter((_, i) => i !== index);
    setRegions(updatedRegions);
    setSelectedRegion(null);
  };

  // Update a region
  const updateRegion = (index, updates) => {
    if (index === null || index === undefined) return;
    
    const updatedRegions = [...regions];
    updatedRegions[index] = {
      ...updatedRegions[index],
      ...updates
    };
    
    setRegions(updatedRegions);
  };

  return {
    canvasRef,
    regions,
    setRegions,
    currentRegion,
    selectedRegion,
    setSelectedRegion,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    addRegion,
    deleteRegion,
    updateRegion,
    drawCanvas,
    canvasReady
  };
};

export default useCanvas;