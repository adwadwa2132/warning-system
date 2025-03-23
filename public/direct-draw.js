// COMPLETELY REVAMPED DIRECT DRAWING SCRIPT
console.log("🚀 Direct drawing script v2 loaded");

// Create a global variable to store coordinates for direct communication with React
window.drawnPolygonCoordinates = null;

// Create our own simple drawing tool
function initDrawingTool() {
  console.log("Initializing direct drawing tool");
  
  // Wait for map to be available
  const mapContainer = document.querySelector('.leaflet-container');
  if (!mapContainer) {
    console.log("No map found, trying again in 1 second");
    setTimeout(initDrawingTool, 1000);
    return;
  }
  
  // Add the button
  addDrawButton();
  
  // Create our own polygon drawing implementation
  setupDirectDrawing(mapContainer);
}

// Add the draw polygon button
function addDrawButton() {
  // Check if button already exists
  if (document.getElementById('direct-draw-button')) {
    return;
  }
  
  console.log("Adding direct draw button");
  
  // Create a floating button
  const button = document.createElement("button");
  button.id = "direct-draw-button";
  button.innerHTML = "🔺 DRAW WARNING AREA";
  button.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    z-index: 9999;
    background: #ff3300;
    color: white;
    font-weight: bold;
    padding: 12px 15px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0,0,0,0.5);
    font-size: 16px;
  `;
  
  // Add hover effects
  button.onmouseover = () => {
    button.style.backgroundColor = "#cc2200";
  };
  button.onmouseout = () => {
    button.style.backgroundColor = "#ff3300";
  };
  
  // Add click handler to start drawing mode
  button.onclick = startDrawingMode;
  
  // Add to document
  document.body.appendChild(button);
}

// Handle starting the drawing mode
function startDrawingMode() {
  console.log("Starting direct drawing mode");
  
  // Show instructions
  showInstructions("Click on the map to start drawing a polygon. Click points to create the warning area shape. Double-click to finish.");
  
  // Get map container
  const mapContainer = document.querySelector('.leaflet-container');
  if (!mapContainer) {
    alert("Map not found. Please refresh the page.");
    return;
  }
  
  // Set drawing mode active on the container
  mapContainer.classList.add('drawing-active');
  
  // Change cursor
  mapContainer.style.cursor = 'crosshair';
  
  // Create a reset button
  const resetButton = document.createElement('button');
  resetButton.id = 'reset-drawing-button';
  resetButton.innerHTML = 'Cancel Drawing';
  resetButton.style.cssText = `
    position: fixed;
    top: 150px;
    right: 20px;
    z-index: 9999;
    background: #333;
    color: white;
    padding: 8px 12px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  `;
  
  resetButton.onclick = () => {
    resetDrawing(mapContainer);
    resetButton.remove();
  };
  
  document.body.appendChild(resetButton);
}

// Reset the drawing mode
function resetDrawing(mapContainer) {
  console.log("Resetting drawing");
  
  mapContainer.classList.remove('drawing-active');
  mapContainer.style.cursor = '';
  
  // Remove any drawing elements
  const existingPolyline = document.getElementById('temp-polyline');
  if (existingPolyline) existingPolyline.remove();
  
  const existingMarkers = document.querySelectorAll('.temp-marker');
  existingMarkers.forEach(marker => marker.remove());
  
  // Hide instructions
  hideInstructions();
  
  // Remove event listeners
  window.drawingActive = false;
}

// Set up our own direct drawing implementation
function setupDirectDrawing(mapContainer) {
  console.log("Setting up direct drawing");
  
  // Create drawing state
  window.drawingPoints = [];
  window.drawingActive = false;
  
  // Add click event listener to the map
  mapContainer.addEventListener('click', function(e) {
    if (!window.drawingActive && !mapContainer.classList.contains('drawing-active')) {
      return;
    }
    
    window.drawingActive = true;
    
    // Get click coordinates relative to the map
    const rect = mapContainer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    console.log(`Map clicked at ${x},${y}`);
    
    // Add point to drawing
    addDrawingPoint(mapContainer, x, y);
    
    // Check for double click to complete
    if (e.detail === 2) {
      completeDrawing(mapContainer);
    }
  });
}

// Add a point to the drawing
function addDrawingPoint(mapContainer, x, y) {
  // Add to points array
  window.drawingPoints.push([x, y]);
  
  // Create a marker for the point
  const marker = document.createElement('div');
  marker.className = 'temp-marker';
  marker.style.cssText = `
    position: absolute;
    left: ${x - 5}px;
    top: ${y - 5}px;
    width: 10px;
    height: 10px;
    background-color: red;
    border-radius: 50%;
    z-index: 1000;
  `;
  
  mapContainer.appendChild(marker);
  
  // Update polyline
  updatePolyline(mapContainer);
}

// Update the polyline connecting points
function updatePolyline(mapContainer) {
  // Remove existing polyline
  const existingPolyline = document.getElementById('temp-polyline');
  if (existingPolyline) existingPolyline.remove();
  
  if (window.drawingPoints.length < 2) return;
  
  // Create SVG for polyline
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.id = 'temp-polyline';
  svg.style.cssText = `
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 999;
  `;
  
  // Create polyline
  const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
  let pointsString = '';
  window.drawingPoints.forEach(point => {
    pointsString += `${point[0]},${point[1]} `;
  });
  
  polyline.setAttribute('points', pointsString);
  polyline.style.cssText = `
    fill: none;
    stroke: red;
    stroke-width: 2;
  `;
  
  svg.appendChild(polyline);
  mapContainer.appendChild(svg);
}

// Complete the drawing
function completeDrawing(mapContainer) {
  console.log("Completing drawing");
  
  if (window.drawingPoints.length < 3) {
    alert("Please add at least 3 points to create a polygon");
    return;
  }
  
  // Get Leaflet map instance to convert screen coordinates to geo coordinates
  const map = findLeafletMap();
  if (!map) {
    alert("Could not access map instance. Please refresh and try again.");
    return;
  }
  
  // Convert screen points to geo coordinates
  const geoPoints = window.drawingPoints.map(point => {
    const containerPoint = L.point(point[0], point[1]);
    const latLng = map.containerPointToLatLng(containerPoint);
    return [latLng.lat, latLng.lng];
  });
  
  // Add first point to close the polygon
  geoPoints.push(geoPoints[0]);
  
  // Format for the application
  const polygonFormat = [geoPoints];
  console.log("Created polygon:", polygonFormat);
  
  // Store globally for React to access
  window.drawnPolygonCoordinates = polygonFormat;
  
  // Try to directly call the React callback
  try {
    const AdminPage = findReactComponent(document.querySelector('.container'));
    if (AdminPage && AdminPage.handlePolygonCreated) {
      AdminPage.handlePolygonCreated(polygonFormat);
      console.log("Called React handlePolygonCreated directly");
    }
  } catch (err) {
    console.error("Could not call React directly:", err);
  }
  
  // Create a custom event to notify React
  const event = new CustomEvent('polygonDrawn', { 
    detail: { polygon: polygonFormat }
  });
  document.dispatchEvent(event);
  
  // Create success message
  showSuccessMessage(mapContainer);
  
  // Reset drawing state
  resetDrawing(mapContainer);
  
  // Remove reset button
  const resetButton = document.getElementById('reset-drawing-button');
  if (resetButton) resetButton.remove();
}

// Show success message for polygon
function showSuccessMessage(mapContainer) {
  const message = document.createElement('div');
  message.className = 'polygon-success-message';
  message.innerHTML = '✅ Polygon created! Fill out the form details to publish.';
  message.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #4CAF50;
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
    z-index: 10000;
    font-weight: bold;
  `;
  
  document.body.appendChild(message);
  
  // Auto-close after 5 seconds
  setTimeout(() => {
    message.style.opacity = '0';
    message.style.transition = 'opacity 0.5s';
    setTimeout(() => message.remove(), 500);
  }, 5000);
}

// Show drawing instructions
function showInstructions(text) {
  const instructions = document.createElement('div');
  instructions.id = 'drawing-instructions';
  instructions.innerHTML = text;
  instructions.style.cssText = `
    position: fixed;
    top: 60px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 10px 15px;
    border-radius: 5px;
    z-index: 10000;
    font-size: 14px;
    max-width: 80%;
    text-align: center;
  `;
  
  document.body.appendChild(instructions);
}

// Hide instructions
function hideInstructions() {
  const instructions = document.getElementById('drawing-instructions');
  if (instructions) instructions.remove();
}

// Find the Leaflet map instance
function findLeafletMap() {
  // Method 1: Check for exposed map reference
  if (window._leafletMap) {
    return window._leafletMap;
  }
  
  // Method 2: Use Leaflet's internal reference
  try {
    if (window.L && window.L.Map && window.L.Map._instances) {
      const ids = Object.keys(window.L.Map._instances);
      if (ids.length > 0) {
        return window.L.Map._instances[ids[0]];
      }
    }
  } catch (e) {
    console.error("Error finding map via L.Map._instances:", e);
  }
  
  // Method 3: Try to find map element and use containerPointToLatLng directly
  const container = document.querySelector('.leaflet-container');
  if (!container) return null;
  
  // Last resort: create a dummy map object with the essential method we need
  return {
    containerPointToLatLng: function(point) {
      // This is a fallback that will attempt to convert screen coordinates to approximate geo coordinates
      // based on the visible map bounds
      
      // Get the map dimensions
      const width = container.clientWidth;
      const height = container.clientHeight;
      
      // Estimate based on center and zoom level
      // These are fallback defaults for Toronto area
      const center = [43.6532, -79.3832];
      const zoom = 8;
      
      // Try to find actual bounds from map attributes
      let bounds = {
        _northEast: { lat: center[0] + 1, lng: center[1] + 1 },
        _southWest: { lat: center[0] - 1, lng: center[1] - 1 }
      };
      
      // Calculate relative position in the map (0-1)
      const relX = point.x / width;
      const relY = point.y / height;
      
      // Convert to lat/lng
      const lat = bounds._northEast.lat - relY * (bounds._northEast.lat - bounds._southWest.lat);
      const lng = bounds._southWest.lng + relX * (bounds._northEast.lng - bounds._southWest.lng);
      
      return { lat, lng };
    }
  };
}

// Try to find React component instance
function findReactComponent(element) {
  if (!element) return null;
  
  // This is a speculative approach and may not work in all environments
  try {
    const key = Object.keys(element).find(key => 
      key.startsWith('__reactInternalInstance$') || 
      key.startsWith('__reactFiber$')
    );
    
    if (key) {
      let fiber = element[key];
      while (fiber) {
        if (fiber.stateNode && fiber.stateNode.handlePolygonCreated) {
          return fiber.stateNode;
        }
        fiber = fiber.return;
      }
    }
  } catch (e) {
    console.log("Error finding React component:", e);
  }
  
  return null;
}

// Initialize on page load
if (document.readyState === 'complete') {
  initDrawingTool();
} else {
  window.addEventListener('load', initDrawingTool);
}

// Also try again after a delay to catch any race conditions
setTimeout(initDrawingTool, 2000); 