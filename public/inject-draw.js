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
    
    // Always load Leaflet Draw to ensure it's available
    loadLeafletDraw();
    
    // Wait for Leaflet Draw to be loaded
    const checkAndCreateControls = () => {
      if (window.L && window.L.Draw) {
        createDrawControls();
      } else {
        console.log("Waiting for Leaflet Draw to load...");
        setTimeout(checkAndCreateControls, 500);
      }
    };
    
    setTimeout(checkAndCreateControls, 1000);
  }
  
  // Create the actual draw controls
  function createDrawControls() {
    // Check if controls already exist
    if (document.querySelector('.leaflet-draw')) {
      console.log("Draw controls already exist, no need to inject");
      return;
    }
    
    console.log("Creating draw controls");
    
    // Find map instance directly from the React component
    let mapInstance = null;
    
    // Try to find the map instance in ReactDOM
    const reactInstances = findReactInstance();
    if (reactInstances && reactInstances.length > 0) {
      console.log("Found React instances:", reactInstances.length);
    }
    
    // Create direct DOM controls
    createDirectDrawControls();
  }
  
  // Find React instances (may help debug)
  function findReactInstance() {
    const instances = [];
    try {
      const containerElements = document.querySelectorAll('[data-reactroot], [data-reactid]');
      console.log("Found React roots:", containerElements.length);
      return Array.from(containerElements);
    } catch (err) {
      console.error("Error finding React instances:", err);
      return instances;
    }
  }
  
  // Create direct DOM controls with hardcoded polygon drawing
  function createDirectDrawControls() {
    try {
      // Find or create container for controls
      const container = document.querySelector('.leaflet-top.leaflet-right') || 
                        createControlContainer();
      
      // Create button with very visible styling
      const btn = document.createElement('div');
      btn.className = 'custom-draw-control';
      btn.style.cssText = `
        position: absolute;
        top: 10px;
        right: 10px;
        background: white;
        border: 2px solid rgba(0,0,0,0.2);
        border-radius: 4px;
        z-index: 1000;
        padding: 5px;
        box-shadow: 0 1px 5px rgba(0,0,0,0.4);
      `;
      
      // Create polygon button
      const polygonBtn = document.createElement('button');
      polygonBtn.textContent = "🔺 Draw Polygon";
      polygonBtn.style.cssText = `
        display: block;
        width: 120px;
        padding: 8px;
        margin: 2px;
        background: #fff;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-weight: bold;
        cursor: pointer;
        text-align: center;
        color: #333;
      `;
      
      // Add hover effect
      polygonBtn.onmouseover = () => {
        polygonBtn.style.backgroundColor = '#f0f0f0';
      };
      polygonBtn.onmouseout = () => {
        polygonBtn.style.backgroundColor = '#fff';
      };
      
      // Add click handler
      polygonBtn.onclick = function(e) {
        e.preventDefault();
        console.log("Draw polygon button clicked");
        
        // Try using the exposed helper first
        if (window._startDrawingPolygon && typeof window._startDrawingPolygon === 'function') {
          console.log("Using exposed drawing helper from Map component");
          const success = window._startDrawingPolygon();
          if (success) {
            console.log("Successfully started drawing mode via helper");
            return;
          }
        }
        
        // Fallback to direct drawing mode initialization
        initDrawingMode();
      };
      
      // Add to DOM
      btn.appendChild(polygonBtn);
      
      // Add to the map container directly
      const mapContainer = document.querySelector('.leaflet-container');
      if (mapContainer) {
        mapContainer.appendChild(btn);
        console.log("Added custom draw button directly to map container");
      } else {
        document.body.appendChild(btn);
        console.log("Added custom draw button to body");
      }
      
      console.log("Custom draw control created");
    } catch (err) {
      console.error("Error creating direct control:", err);
    }
  }
  
  // Initialize drawing mode by finding Leaflet map instance
  function initDrawingMode() {
    try {
      // Look for map in various places
      const mapContainer = document.querySelector('.leaflet-container');
      if (!mapContainer) {
        console.error("No map container found");
        return;
      }
      
      // Ensure Leaflet and Draw exist
      if (!window.L || !window.L.Draw) {
        console.error("Leaflet Draw not available");
        loadLeafletDraw();
        alert("Drawing tools not ready. Please try again in a few seconds.");
        return;
      }
      
      // Try to get the map using internal Leaflet methods
      const maps = findAllMaps();
      if (maps.length === 0) {
        console.error("No map instances found");
        useBackupDrawingMethod(mapContainer);
        return;
      }
      
      // Use the first map instance
      const map = maps[0];
      console.log("Found map instance:", map);
      
      // Create a new drawing handler
      const handler = new window.L.Draw.Polygon(map, {
        shapeOptions: { color: '#f00' }
      });
      
      // Enable drawing
      handler.enable();
      console.log("Drawing mode enabled");
      
    } catch (err) {
      console.error("Error initializing drawing mode:", err);
    }
  }
  
  // Find all map instances using various methods
  function findAllMaps() {
    const maps = [];
    
    try {
      // Method 1: Use Leaflet's internal container ID mapping
      if (window.L && window.L.Map && window.L.Map._instances) {
        for (let id in window.L.Map._instances) {
          maps.push(window.L.Map._instances[id]);
        }
      }
      
      // Method 2: Access through map container's internal properties
      document.querySelectorAll('.leaflet-container').forEach(container => {
        if (container._leaflet_id && window.L.Map._instances) {
          const mapInstance = window.L.Map._instances[container._leaflet_id];
          if (mapInstance && !maps.includes(mapInstance)) {
            maps.push(mapInstance);
          }
        }
      });
      
      // Method 3: Look for map instance in global scope (sometimes exposed by React)
      if (window._leafletMap) {
        maps.push(window._leafletMap);
      }
      
      console.log(`Found ${maps.length} map instances`);
      return maps;
      
    } catch (err) {
      console.error("Error finding map instances:", err);
      return [];
    }
  }
  
  // Backup method if we can't find the map instance
  function useBackupDrawingMethod(mapContainer) {
    try {
      console.log("Trying backup drawing method");
      
      // Create fake map reference
      const fakeMap = {
        _container: mapContainer,
        getContainer: function() { return mapContainer; },
        fire: function(eventName, data) {
          console.log("Map event fired:", eventName, data);
          
          // Dispatch custom event for React to pick up
          const customEvent = new CustomEvent('leaflet-draw-' + eventName, { 
            detail: data,
            bubbles: true 
          });
          mapContainer.dispatchEvent(customEvent);
        }
      };
      
      // Try to enable drawing
      if (window.L && window.L.Draw && window.L.Draw.Polygon) {
        const handler = new window.L.Draw.Polygon(fakeMap);
        handler.enable();
        console.log("Enabled drawing with fake map");
      }
    } catch (err) {
      console.error("Backup drawing method failed:", err);
    }
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
  
  // Load Leaflet Draw script and CSS
  function loadLeafletDraw() {
    // Check if already loaded
    if (document.querySelector('script[src*="leaflet.draw.js"]')) {
      console.log("Leaflet Draw script already loading");
      return;
    }
    
    console.log("Loading Leaflet Draw script and CSS");
    
    // Load script
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.js';
    script.onload = function() {
      console.log("✅ Leaflet Draw script loaded successfully");
    };
    script.onerror = function() {
      console.error("❌ Failed to load Leaflet Draw script");
    };
    document.body.appendChild(script);
    
    // Load CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.css';
    document.head.appendChild(link);
  }
  
  // Start the process
  waitForMap();
  
  // Try again after delays in case the map loads later
  setTimeout(waitForMap, 2000);
  setTimeout(waitForMap, 5000);
})(); 