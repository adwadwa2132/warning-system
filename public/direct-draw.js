// Direct approach to add drawing functionality
console.log("🚀 Direct drawing script loaded");

// Create a prominent button
function addDrawButton() {
  console.log("Creating prominent draw button");
  
  // Create a floating button
  const button = document.createElement("button");
  button.id = "direct-draw-button";
  button.innerHTML = "🖌️ Draw Polygon";
  button.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    z-index: 9999;
    background: #3388ff;
    color: white;
    font-weight: bold;
    padding: 10px 15px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    font-size: 16px;
  `;
  
  // Add hover effects
  button.onmouseover = () => {
    button.style.backgroundColor = "#1166dd";
  };
  button.onmouseout = () => {
    button.style.backgroundColor = "#3388ff";
  };
  
  // Add click handler
  button.onclick = enableDrawing;
  
  // Add to document
  document.body.appendChild(button);
  console.log("Button added to page:", button);
}

// The main function to enable drawing
function enableDrawing() {
  console.log("Draw button clicked, attempting to enable drawing...");
  
  // Make sure Leaflet and Leaflet Draw are loaded
  loadLeafletDrawIfNeeded(() => {
    try {
      // Find map element
      const mapContainer = document.querySelector('.leaflet-container');
      if (!mapContainer) {
        alert("Map not found. Please refresh the page.");
        return;
      }
      
      // Try to access the map instance
      const map = findLeafletMap();
      if (!map) {
        alert("Map instance not found. Please refresh the page.");
        return;
      }
      
      console.log("Found map instance:", map);
      
      // Create and enable drawing handler
      const drawHandler = new L.Draw.Polygon(map, {
        shapeOptions: { 
          color: '#ff3300',
          weight: 3
        }
      });
      
      drawHandler.enable();
      
      // Show a toast notification
      showToast("Polygon drawing mode activated. Click on the map to start drawing.");
      
    } catch (error) {
      console.error("Error enabling drawing:", error);
      alert("Failed to enable drawing. See console for details.");
    }
  });
}

// Load Leaflet Draw library if not already loaded
function loadLeafletDrawIfNeeded(callback) {
  if (window.L && window.L.Draw) {
    console.log("Leaflet Draw already loaded");
    callback();
    return;
  }
  
  console.log("Loading Leaflet Draw...");
  
  // Load Leaflet first if needed
  if (!window.L) {
    const leafletScript = document.createElement('script');
    leafletScript.src = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js';
    leafletScript.onload = () => {
      // Then load Leaflet Draw
      const drawScript = document.createElement('script');
      drawScript.src = 'https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.js';
      drawScript.onload = () => {
        console.log("Leaflet Draw loaded successfully");
        callback();
      };
      drawScript.onerror = (err) => {
        console.error("Failed to load Leaflet Draw:", err);
        alert("Failed to load drawing tools. Please refresh the page.");
      };
      document.head.appendChild(drawScript);
      
      // Load CSS
      const drawCss = document.createElement('link');
      drawCss.rel = 'stylesheet';
      drawCss.href = 'https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.css';
      document.head.appendChild(drawCss);
    };
    document.head.appendChild(leafletScript);
  } else {
    // Just load Leaflet Draw
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.js';
    script.onload = () => {
      console.log("Leaflet Draw loaded successfully");
      callback();
    };
    document.head.appendChild(script);
    
    // Load CSS
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.css';
    document.head.appendChild(css);
  }
}

// Find the Leaflet map instance
function findLeafletMap() {
  console.log("Searching for Leaflet map instance...");
  
  // Method 1: Check for exposed map reference
  if (window._leafletMap) {
    console.log("Found global map reference");
    return window._leafletMap;
  }
  
  // Method 2: Use Leaflet's internal reference
  if (window.L && window.L.Map && window.L.Map._instances) {
    const instances = Object.values(window.L.Map._instances);
    if (instances.length > 0) {
      console.log(`Found ${instances.length} map instances via L.Map._instances`);
      return instances[0];
    }
  }
  
  // Method 3: Use DOM approach
  const container = document.querySelector('.leaflet-container');
  if (container && container._leaflet_id && window.L.Map._instances) {
    const map = window.L.Map._instances[container._leaflet_id];
    if (map) {
      console.log("Found map via container._leaflet_id");
      return map;
    }
  }
  
  // Method 4: Try to find react instance
  try {
    // This is a last-resort attempt to find the React component
    // that might have the map reference
    for (const key in window) {
      if (key.startsWith('__REACT_DEVTOOLS_GLOBAL_HOOK')) {
        console.log("Found React DevTools hook, trying to find map component");
      }
    }
  } catch (e) {
    console.log("React search failed:", e);
  }
  
  console.error("Could not find map instance");
  return null;
}

// Show a toast notification
function showToast(message) {
  const toast = document.createElement('div');
  toast.innerHTML = message;
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
    z-index: 10000;
    font-size: 14px;
  `;
  
  document.body.appendChild(toast);
  
  // Remove after 5 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.5s';
    setTimeout(() => toast.remove(), 500);
  }, 5000);
}

// Start when the page is fully loaded
if (document.readyState === 'complete') {
  addDrawButton();
} else {
  window.addEventListener('load', addDrawButton);
}

// Also try again after a short delay
setTimeout(addDrawButton, 2000); 