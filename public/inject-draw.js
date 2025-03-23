// This script forcibly adds Leaflet Draw controls if they're missing
(function() {
  console.log("Leaflet Draw injector activated");
  
  // Wait for map to be ready
  function waitForMap() {
    if (document.querySelector('.leaflet-container')) {
      console.log("Map found, proceeding with draw control injection");
      injectDrawControls();
    } else {
      console.log("Map not found yet, waiting...");
      setTimeout(waitForMap, 500);
    }
  }
  
  // Try to inject draw controls
  function injectDrawControls() {
    console.log("Attempting to inject draw controls");
    
    // Check if we need to add the script
    if (!window.L || !window.L.Draw) {
      console.log("Leaflet Draw not found, loading script...");
      loadLeafletDraw();
      return;
    }
    
    // Check if controls already exist
    if (document.querySelector('.leaflet-draw')) {
      console.log("Draw controls already exist, no need to inject");
      return;
    }
    
    // Find or create container for controls
    const container = document.querySelector('.leaflet-top.leaflet-right') || 
                      createControlContainer();
    
    // Create draw control
    const drawControl = document.createElement('div');
    drawControl.className = 'leaflet-control-draw leaflet-bar leaflet-control';
    drawControl.style.cssText = 'display: block !important; visibility: visible !important; z-index: 1000 !important; background: white; border: 2px solid rgba(0,0,0,0.2); border-radius: 4px;';
    
    // Create polygon button
    const polygonBtn = document.createElement('a');
    polygonBtn.href = '#';
    polygonBtn.className = 'leaflet-draw-draw-polygon';
    polygonBtn.title = 'Draw a polygon';
    polygonBtn.innerHTML = '<span>▢</span>'; // Basic polygon shape
    polygonBtn.style.cssText = `
      display: block !important;
      width: 30px !important;
      height: 30px !important;
      line-height: 30px !important;
      text-align: center !important;
      text-decoration: none !important;
      color: black !important;
      background: white !important;
      font-weight: bold !important;
      font-size: 18px !important;
    `;
    
    // Add click handler
    polygonBtn.onclick = function(e) {
      e.preventDefault();
      console.log("Custom polygon button clicked");
      
      try {
        const map = findMap();
        if (!map) {
          console.error("Could not find map instance");
          return;
        }
        
        if (window.L && window.L.Draw && window.L.Draw.Polygon) {
          const handler = new window.L.Draw.Polygon(map, {
            shapeOptions: { color: '#f00' }
          });
          handler.enable();
          console.log("Polygon drawing enabled");
        } else {
          console.error("Leaflet Draw not available");
          alert("Drawing tools not loaded properly. Please refresh the page.");
        }
      } catch (err) {
        console.error("Error enabling drawing:", err);
      }
    };
    
    // Add to DOM
    drawControl.appendChild(polygonBtn);
    container.appendChild(drawControl);
    console.log("Custom draw controls added:", drawControl);
  }
  
  // Helper to find the map instance
  function findMap() {
    // Try to get the map from Leaflet's internal _leaflet_id mapping
    const container = document.querySelector('.leaflet-container');
    if (!container) return null;
    
    const id = container._leaflet_id;
    if (id && window.L && window.L.map && window.L.map._instances) {
      return window.L.map._instances[id];
    }
    
    // Fallback - create a "fake" map object that just wraps the container
    return {
      _container: container,
      getContainer: function() { return container; }
    };
  }
  
  // Create control container if missing
  function createControlContainer() {
    const mapContainer = document.querySelector('.leaflet-container');
    if (!mapContainer) {
      console.error("Cannot find map container");
      return document.body;
    }
    
    const controlContainer = document.createElement('div');
    controlContainer.className = 'leaflet-control-container';
    mapContainer.appendChild(controlContainer);
    
    const topRight = document.createElement('div');
    topRight.className = 'leaflet-top leaflet-right';
    controlContainer.appendChild(topRight);
    
    console.log("Created control container:", topRight);
    return topRight;
  }
  
  // Load Leaflet Draw script
  function loadLeafletDraw() {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.js';
    script.onload = function() {
      console.log("Leaflet Draw loaded, now injecting controls");
      setTimeout(injectDrawControls, 500);
    };
    script.onerror = function() {
      console.error("Failed to load Leaflet Draw");
    };
    document.body.appendChild(script);
    
    // Also add CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.css';
    document.head.appendChild(link);
  }
  
  // Start the process
  waitForMap();
  
  // Also try again after a delay (in case the map loads after this script)
  setTimeout(waitForMap, 3000);
})(); 