const fs = require('fs');
const path = require('path');

console.log('Building fully functional static site directly...');

// Clean previous build files
console.log('Cleaning previous build files...');
try {
  if (fs.existsSync('.next')) {
    fs.rmSync('.next', { recursive: true, force: true });
    console.log('Removed .next directory');
  }
  
  if (fs.existsSync('out')) {
    fs.rmSync('out', { recursive: true, force: true });
    console.log('Removed out directory');
  }
} catch (error) {
  console.error('Error during cleanup:', error);
}

// Create the output directory structure
console.log('Creating directory structure...');
try {
  fs.mkdirSync('out', { recursive: true });
  fs.mkdirSync('out/static', { recursive: true });
  fs.mkdirSync('out/static/css', { recursive: true });
  fs.mkdirSync('out/static/js', { recursive: true });
  fs.mkdirSync('out/static/images', { recursive: true });
  fs.mkdirSync('out/admin', { recursive: true });
} catch (error) {
  console.error('Error creating directories:', error);
  process.exit(1);
}

// Create CSS files
console.log('Creating CSS files...');
const mainCss = `
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  margin: 0;
  padding: 0;
  color: #333;
  background-color: #f5f5f5;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

header {
  background-color: #0070f3;
  color: white;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

header h1 {
  margin: 0;
  font-size: 1.8rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

nav a {
  color: white;
  text-decoration: none;
  margin-left: 20px;
  font-weight: 500;
}

.map-container {
  height: 600px;
  margin: 20px 0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.controls {
  background: white;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.warnings-list {
  background: white;
  padding: 15px;
  border-radius: 8px;
  margin-top: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.warning-item {
  border-bottom: 1px solid #eee;
  padding: 10px 0;
}

.warning-item:last-child {
  border-bottom: none;
}

.warning-severity-high {
  border-left: 4px solid #ff4d4f;
  padding-left: 10px;
}

.warning-severity-medium {
  border-left: 4px solid #faad14;
  padding-left: 10px;
}

.warning-severity-low {
  border-left: 4px solid #52c41a;
  padding-left: 10px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

input, select, textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

button {
  background-color: #0070f3;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

button:hover {
  background-color: #005cc5;
}

button.secondary {
  background-color: #f0f0f0;
  color: #333;
}

button.secondary:hover {
  background-color: #e0e0e0;
}

button.warning {
  background-color: #ff4d4f;
}

button.warning:hover {
  background-color: #ff1f1f;
}

.flex {
  display: flex;
}

.justify-between {
  justify-content: space-between;
}

.items-center {
  align-items: center;
}

.mt-4 {
  margin-top: 1rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.login-container {
  max-width: 400px;
  margin: 80px auto;
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.login-container h2 {
  margin-top: 0;
  text-align: center;
  color: #0070f3;
}

.hidden {
  display: none;
}

.severity-filter {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.severity-filter button {
  flex: 1;
}

.severity-filter button.active {
  background-color: #1890ff;
}

.radar-control {
  margin-top: 10px;
}

.radar-control label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.radar-control input {
  width: auto;
}

footer {
  text-align: center;
  padding: 20px 0;
  color: #666;
  font-size: 14px;
  margin-top: 40px;
}

@media (max-width: 768px) {
  .map-container {
    height: 400px;
  }
  
  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }
  
  nav {
    margin-top: 10px;
  }
  
  nav a {
    margin-left: 0;
    margin-right: 20px;
  }
}
`;

try {
  fs.writeFileSync('out/static/css/main.css', mainCss);
  console.log('Created main CSS file');
} catch (error) {
  console.error('Error creating CSS file:', error);
}

// Create JavaScript for the map and warning functionality
console.log('Creating JavaScript files...');
const commonJs = `
// Store warnings in local storage for demo
function getWarnings() {
  const warnings = localStorage.getItem('weatherWarnings');
  return warnings ? JSON.parse(warnings) : [];
}

function saveWarnings(warnings) {
  localStorage.setItem('weatherWarnings', JSON.stringify(warnings));
}

// Demo data if no warnings exist
function initializeDemoWarningsIfNeeded() {
  let warnings = getWarnings();
  
  if (warnings.length === 0) {
    // Add some demo warnings
    warnings = [
      {
        id: '1',
        title: 'Heavy Rainfall Warning',
        description: 'Expect heavy rainfall that may cause flash flooding in low-lying areas.',
        severity: 'high',
        polygon: [
          [40.7128, -74.0060],
          [40.7500, -74.0060],
          [40.7500, -73.9500],
          [40.7128, -73.9500]
        ],
        color: '#ff4d4f',
        created: new Date().toISOString(),
        expires: new Date(Date.now() + 86400000).toISOString() // 24 hours from now
      },
      {
        id: '2',
        title: 'Strong Wind Advisory',
        description: 'Strong winds expected with gusts up to 40mph.',
        severity: 'medium',
        polygon: [
          [40.7000, -73.9000],
          [40.7200, -73.9000],
          [40.7200, -73.8800],
          [40.7000, -73.8800]
        ],
        color: '#faad14',
        created: new Date().toISOString(),
        expires: new Date(Date.now() + 43200000).toISOString() // 12 hours from now
      }
    ];
    saveWarnings(warnings);
  }
  
  return warnings;
}

// Format date for display
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString();
}

// Check if a warning is expired
function isExpired(warning) {
  return new Date(warning.expires) < new Date();
}

// Filter out expired warnings
function getActiveWarnings() {
  return getWarnings().filter(warning => !isExpired(warning));
}

// Get color based on severity
function getSeverityColor(severity) {
  switch(severity.toLowerCase()) {
    case 'high':
      return '#ff4d4f';
    case 'medium':
      return '#faad14';
    case 'low':
      return '#52c41a';
    default:
      return '#1890ff';
  }
}

// Generate a unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Initialize radar layer
let radarLayer = null;

// Add radar to map
function addRadar(map) {
  if (radarLayer) {
    map.removeLayer(radarLayer);
  }
  
  // Using OpenWeatherMap radar tiles as an example
  // Note: In a real app, you would use a valid API key
  radarLayer = L.tileLayer('https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=YOUR_API_KEY', {
    maxZoom: 18,
    opacity: 0.6
  }).addTo(map);
}

// Remove radar from map
function removeRadar(map) {
  if (radarLayer) {
    map.removeLayer(radarLayer);
    radarLayer = null;
  }
}
`;

const mainJs = `
// Initialize map
let map;
let currentFilter = 'all';
let showRadar = false;
let warningLayers = [];

function initMap() {
  // Initialize demo data
  initializeDemoWarningsIfNeeded();
  
  // Create map centered on New York (for demo)
  map = L.map('map').setView([40.7128, -74.0060], 11);
  
  // Add OpenStreetMap tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
  
  // Display warnings on the map
  displayWarnings();
  
  // Update warnings list
  updateWarningsList();
  
  // Setup event listeners
  document.getElementById('toggleRadar').addEventListener('change', function() {
    showRadar = this.checked;
    if (showRadar) {
      addRadar(map);
    } else {
      removeRadar(map);
    }
  });
  
  // Setup filter buttons
  document.querySelectorAll('.severity-filter button').forEach(button => {
    button.addEventListener('click', function() {
      currentFilter = this.dataset.severity;
      
      // Update active class
      document.querySelectorAll('.severity-filter button').forEach(btn => {
        btn.classList.remove('active');
      });
      this.classList.add('active');
      
      // Refresh warnings display
      displayWarnings();
      updateWarningsList();
    });
  });
}

function displayWarnings() {
  // Clear existing warning layers
  warningLayers.forEach(layer => map.removeLayer(layer));
  warningLayers = [];
  
  // Get active warnings
  const warnings = getActiveWarnings();
  
  // Filter warnings by severity if needed
  const filteredWarnings = currentFilter === 'all' 
    ? warnings 
    : warnings.filter(w => w.severity === currentFilter);
  
  // Add each warning to the map
  filteredWarnings.forEach(warning => {
    if (warning.polygon && warning.polygon.length > 0) {
      // Create polygon
      const polygon = L.polygon(warning.polygon, {
        color: warning.color || getSeverityColor(warning.severity),
        fillOpacity: 0.4
      }).addTo(map);
      
      // Add popup
      polygon.bindPopup(`
        <strong>${warning.title}</strong><br>
        ${warning.description}<br>
        <small>Expires: ${formatDate(warning.expires)}</small>
      `);
      
      warningLayers.push(polygon);
    }
  });
}

function updateWarningsList() {
  const warningsListElement = document.getElementById('warningsList');
  warningsListElement.innerHTML = '';
  
  // Get active warnings
  const warnings = getActiveWarnings();
  
  // Filter warnings by severity if needed
  const filteredWarnings = currentFilter === 'all' 
    ? warnings 
    : warnings.filter(w => w.severity === currentFilter);
  
  if (filteredWarnings.length === 0) {
    warningsListElement.innerHTML = '<p>No active warnings.</p>';
    return;
  }
  
  // Sort warnings by severity (high first)
  filteredWarnings.sort((a, b) => {
    const severityOrder = { high: 0, medium: 1, low: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
  
  // Create warning list items
  filteredWarnings.forEach(warning => {
    const warningItem = document.createElement('div');
    warningItem.className = \`warning-item warning-severity-\${warning.severity}\`;
    
    warningItem.innerHTML = \`
      <h3>\${warning.title}</h3>
      <p>\${warning.description}</p>
      <small>Expires: \${formatDate(warning.expires)}</small>
    \`;
    
    warningItem.addEventListener('click', () => {
      // Find the corresponding layer and open its popup
      warningLayers.forEach(layer => {
        // This is a simplistic approach - in a real app you'd need a more reliable way to match
        const layerPolygon = layer.getLatLngs()[0].map(point => [point.lat, point.lng]);
        const warningPolygon = warning.polygon;
        
        if (JSON.stringify(layerPolygon) === JSON.stringify(warningPolygon)) {
          map.fitBounds(layer.getBounds());
          layer.openPopup();
        }
      });
    });
    
    warningsListElement.appendChild(warningItem);
  });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initMap);
`;

const adminJs = `
// Authentication variables
let isAuthenticated = false;
let currentDrawing = null;
let drawControl = null;
let map;
let editingWarning = null;

// Initialize map
function initAdminMap() {
  // Check authentication first
  checkAuth();
  
  // Initialize the map
  map = L.map('map').setView([40.7128, -74.0060], 11);
  
  // Add OpenStreetMap tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
  
  // Initialize drawing control
  initDrawControl();
  
  // Initialize demo data
  initializeDemoWarningsIfNeeded();
  
  // Display warnings
  displayAdminWarnings();
  
  // Setup event listeners
  document.getElementById('loginForm').addEventListener('submit', handleLogin);
  document.getElementById('warningForm').addEventListener('submit', handleWarningSubmit);
  document.getElementById('toggleRadar').addEventListener('change', function() {
    if (this.checked) {
      addRadar(map);
    } else {
      removeRadar(map);
    }
  });
  
  // Setup warning list
  updateAdminWarningsList();
}

function checkAuth() {
  const authSection = document.getElementById('authSection');
  const adminSection = document.getElementById('adminSection');
  
  // For demo, we'll use hardcoded credentials
  // In a real app, this would check with a server
  const username = localStorage.getItem('admin_username');
  const password = localStorage.getItem('admin_password');
  
  isAuthenticated = username === 'admin' && password === 'password';
  
  if (isAuthenticated) {
    authSection.classList.add('hidden');
    adminSection.classList.remove('hidden');
  } else {
    authSection.classList.remove('hidden');
    adminSection.classList.add('hidden');
  }
}

function handleLogin(e) {
  e.preventDefault();
  
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  // For demo purposes, hardcoded credentials
  // In a real app, this would check with a server
  if (username === 'admin' && password === 'password') {
    localStorage.setItem('admin_username', username);
    localStorage.setItem('admin_password', password);
    isAuthenticated = true;
    checkAuth();
    
    // Initialize map controls after authentication
    if (map) {
      initDrawControl();
      displayAdminWarnings();
    }
  } else {
    alert('Invalid credentials');
  }
}

function initDrawControl() {
  if (!isAuthenticated) return;
  
  // Add Leaflet.draw plugin
  const drawnItems = new L.FeatureGroup();
  map.addLayer(drawnItems);
  
  // Configure draw control
  drawControl = new L.Control.Draw({
    draw: {
      polyline: false,
      rectangle: true,
      circle: false,
      circlemarker: false,
      marker: false,
      polygon: {
        allowIntersection: false,
        drawError: {
          color: '#e1e100',
          message: '<strong>Error:</strong> shape cannot intersect itself!'
        },
        shapeOptions: {
          color: '#0070f3'
        }
      }
    },
    edit: {
      featureGroup: drawnItems,
      remove: true
    }
  });
  map.addControl(drawControl);
  
  // Handle drawing events
  map.on(L.Draw.Event.CREATED, function(e) {
    const layer = e.layer;
    drawnItems.addLayer(layer);
    
    // Save the current drawing
    if (layer instanceof L.Polygon || layer instanceof L.Rectangle) {
      currentDrawing = layer.getLatLngs()[0].map(point => [point.lat, point.lng]);
      
      // Show the warning form
      document.getElementById('warningFormSection').classList.remove('hidden');
      
      // If editing, populate the form
      if (editingWarning) {
        document.getElementById('warningTitle').value = editingWarning.title;
        document.getElementById('warningDescription').value = editingWarning.description;
        document.getElementById('warningSeverity').value = editingWarning.severity;
        document.getElementById('warningColor').value = editingWarning.color;
        
        // Calculate expiration date
        const expiryDate = new Date(editingWarning.expires);
        const dateStr = expiryDate.toISOString().split('T')[0];
        const timeStr = expiryDate.toTimeString().substring(0, 5);
        
        document.getElementById('expiryDate').value = dateStr;
        document.getElementById('expiryTime').value = timeStr;
      }
    }
  });
  
  // Display existing warnings for editing
  displayAdminWarnings();
}

function displayAdminWarnings() {
  if (!isAuthenticated || !map) return;
  
  // Clear existing layers
  map.eachLayer(layer => {
    if (layer instanceof L.Polygon && !(layer instanceof L.Rectangle)) {
      map.removeLayer(layer);
    }
  });
  
  // Get all warnings, including expired ones
  const warnings = getWarnings();
  
  // Add each warning to the map
  warnings.forEach(warning => {
    if (warning.polygon && warning.polygon.length > 0) {
      // Create polygon
      const polygon = L.polygon(warning.polygon, {
        color: warning.color || getSeverityColor(warning.severity),
        fillOpacity: 0.4
      }).addTo(map);
      
      // Add popup with edit and delete options
      polygon.bindPopup(\`
        <strong>\${warning.title}</strong><br>
        \${warning.description}<br>
        <small>Expires: \${formatDate(warning.expires)}</small><br>
        <button class="edit-warning" data-id="\${warning.id}">Edit</button>
        <button class="delete-warning" data-id="\${warning.id}">Delete</button>
      \`);
      
      // Handle popup actions
      polygon.on('popupopen', function() {
        // Edit button
        document.querySelector('.edit-warning').addEventListener('click', function() {
          const id = this.dataset.id;
          startEditing(id);
          polygon.closePopup();
        });
        
        // Delete button
        document.querySelector('.delete-warning').addEventListener('click', function() {
          const id = this.dataset.id;
          deleteWarning(id);
          polygon.closePopup();
        });
      });
    }
  });
}

function startEditing(warningId) {
  const warnings = getWarnings();
  editingWarning = warnings.find(w => w.id === warningId);
  
  if (editingWarning) {
    // Clear existing drawings
    map.eachLayer(layer => {
      if (layer instanceof L.FeatureGroup) {
        layer.clearLayers();
      }
    });
    
    // Show the drawing tools
    document.getElementById('drawInstructions').classList.remove('hidden');
  }
}

function deleteWarning(warningId) {
  if (confirm('Are you sure you want to delete this warning?')) {
    let warnings = getWarnings();
    warnings = warnings.filter(w => w.id !== warningId);
    saveWarnings(warnings);
    
    // Refresh warnings display
    displayAdminWarnings();
    updateAdminWarningsList();
  }
}

function handleWarningSubmit(e) {
  e.preventDefault();
  
  if (!currentDrawing) {
    alert('Please draw a warning area on the map first.');
    return;
  }
  
  // Get form values
  const title = document.getElementById('warningTitle').value;
  const description = document.getElementById('warningDescription').value;
  const severity = document.getElementById('warningSeverity').value;
  const color = document.getElementById('warningColor').value;
  const expiryDate = document.getElementById('expiryDate').value;
  const expiryTime = document.getElementById('expiryTime').value;
  
  // Create expiry date
  const expires = new Date(\`\${expiryDate}T\${expiryTime}:00\`).toISOString();
  
  // Create warning object
  const warning = {
    id: editingWarning ? editingWarning.id : generateId(),
    title,
    description,
    severity,
    polygon: currentDrawing,
    color,
    created: new Date().toISOString(),
    expires
  };
  
  // Save the warning
  let warnings = getWarnings();
  
  if (editingWarning) {
    // Update existing warning
    warnings = warnings.map(w => w.id === warning.id ? warning : w);
  } else {
    // Add new warning
    warnings.push(warning);
  }
  
  saveWarnings(warnings);
  
  // Reset the form
  document.getElementById('warningForm').reset();
  document.getElementById('warningFormSection').classList.add('hidden');
  
  // Clear the drawing
  currentDrawing = null;
  editingWarning = null;
  
  // Clear existing drawings
  map.eachLayer(layer => {
    if (layer instanceof L.FeatureGroup) {
      layer.clearLayers();
    }
  });
  
  // Refresh warnings display
  displayAdminWarnings();
  updateAdminWarningsList();
}

function updateAdminWarningsList() {
  const warningsListElement = document.getElementById('adminWarningsList');
  if (!warningsListElement) return;
  
  warningsListElement.innerHTML = '';
  
  // Get all warnings, including expired ones
  const warnings = getWarnings();
  
  if (warnings.length === 0) {
    warningsListElement.innerHTML = '<p>No warnings created yet.</p>';
    return;
  }
  
  // Sort warnings by expiry date (newest first)
  warnings.sort((a, b) => new Date(b.expires) - new Date(a.expires));
  
  // Create warning list items
  warnings.forEach(warning => {
    const isExpired = new Date(warning.expires) < new Date();
    
    const warningItem = document.createElement('div');
    warningItem.className = \`warning-item warning-severity-\${warning.severity} \${isExpired ? 'expired' : ''}\`;
    
    warningItem.innerHTML = \`
      <div class="flex justify-between items-center">
        <h3>\${warning.title}</h3>
        <div>
          <button class="edit-btn" data-id="\${warning.id}">Edit</button>
          <button class="delete-btn" data-id="\${warning.id}">Delete</button>
        </div>
      </div>
      <p>\${warning.description}</p>
      <small>Expires: \${formatDate(warning.expires)}</small>
      \${isExpired ? '<span class="expired-tag">Expired</span>' : ''}
    \`;
    
    // Add event listeners
    warningItem.querySelector('.edit-btn').addEventListener('click', function() {
      startEditing(this.dataset.id);
    });
    
    warningItem.querySelector('.delete-btn').addEventListener('click', function() {
      deleteWarning(this.dataset.id);
    });
    
    warningsListElement.appendChild(warningItem);
  });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initAdminMap);
`;

try {
  fs.writeFileSync('out/static/js/common.js', commonJs);
  fs.writeFileSync('out/static/js/main.js', mainJs);
  fs.writeFileSync('out/static/js/admin.js', adminJs);
  console.log('Created JavaScript files');
} catch (error) {
  console.error('Error creating JavaScript files:', error);
}

// Create HTML files
console.log('Creating HTML files...');
const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Weather Warning System</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <link rel="stylesheet" href="/static/css/main.css">
</head>
<body>
  <header>
    <div class="header-content">
      <h1>Weather Warning System</h1>
      <nav>
        <a href="/">Home</a>
        <a href="/admin/">Admin</a>
      </nav>
    </div>
  </header>
  
  <div class="container">
    <div class="controls">
      <h2>Active Weather Warnings</h2>
      
      <div class="severity-filter">
        <button class="active" data-severity="all">All Warnings</button>
        <button data-severity="high">High Severity</button>
        <button data-severity="medium">Medium Severity</button>
        <button data-severity="low">Low Severity</button>
      </div>
      
      <div class="radar-control">
        <label>
          <input type="checkbox" id="toggleRadar"> Show Weather Radar
        </label>
      </div>
    </div>
    
    <div id="map" class="map-container"></div>
    
    <div class="warnings-list">
      <h2>Warning Details</h2>
      <div id="warningsList"></div>
    </div>
  </div>
  
  <footer>
    <p>Weather Warning System &copy; 2025</p>
  </footer>

  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script src="/static/js/common.js"></script>
  <script src="/static/js/main.js"></script>
</body>
</html>`;

const adminHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Panel - Weather Warning System</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.css" />
  <link rel="stylesheet" href="/static/css/main.css">
</head>
<body>
  <header>
    <div class="header-content">
      <h1>Weather Warning System - Admin</h1>
      <nav>
        <a href="/">Home</a>
        <a href="/admin/">Admin</a>
      </nav>
    </div>
  </header>
  
  <div class="container">
    <!-- Authentication Section -->
    <div id="authSection" class="login-container">
      <h2>Admin Login</h2>
      <form id="loginForm">
        <div class="form-group">
          <label for="username">Username</label>
          <input type="text" id="username" required>
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input type="password" id="password" required>
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
    
    <!-- Admin Panel Section -->
    <div id="adminSection" class="hidden">
      <div class="controls">
        <h2>Weather Warning Management</h2>
        
        <div id="drawInstructions">
          <p>Use the drawing tools on the right side of the map to create a warning area.</p>
        </div>
        
        <div class="radar-control">
          <label>
            <input type="checkbox" id="toggleRadar"> Show Weather Radar
          </label>
        </div>
      </div>
      
      <div id="map" class="map-container"></div>
      
      <!-- Warning Form -->
      <div id="warningFormSection" class="warnings-list hidden">
        <h2>Create Warning</h2>
        <form id="warningForm">
          <div class="form-group">
            <label for="warningTitle">Warning Title</label>
            <input type="text" id="warningTitle" required>
          </div>
          
          <div class="form-group">
            <label for="warningDescription">Description</label>
            <textarea id="warningDescription" rows="3" required></textarea>
          </div>
          
          <div class="form-group">
            <label for="warningSeverity">Severity</label>
            <select id="warningSeverity" required>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="warningColor">Color</label>
            <input type="color" id="warningColor" value="#ff4d4f">
          </div>
          
          <div class="form-group">
            <label for="expiryDate">Expiry Date</label>
            <input type="date" id="expiryDate" required>
          </div>
          
          <div class="form-group">
            <label for="expiryTime">Expiry Time</label>
            <input type="time" id="expiryTime" required>
          </div>
          
          <button type="submit">Publish Warning</button>
        </form>
      </div>
      
      <!-- Warning List -->
      <div class="warnings-list">
        <h2>Existing Warnings</h2>
        <div id="adminWarningsList"></div>
      </div>
    </div>
  </div>
  
  <footer>
    <p>Weather Warning System &copy; 2025</p>
  </footer>

  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script src="https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.js"></script>
  <script src="/static/js/common.js"></script>
  <script src="/static/js/admin.js"></script>
</body>
</html>`;

const notFoundHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Not Found - Weather Warning System</title>
  <link rel="stylesheet" href="/static/css/main.css">
</head>
<body>
  <header>
    <div class="header-content">
      <h1>Weather Warning System</h1>
      <nav>
        <a href="/">Home</a>
        <a href="/admin/">Admin</a>
      </nav>
    </div>
  </header>
  
  <div class="container">
    <div class="login-container">
      <h2>Page Not Found</h2>
      <p>The page you are looking for doesn't exist.</p>
      <p><a href="/" class="btn">Go Home</a></p>
    </div>
  </div>
  
  <footer>
    <p>Weather Warning System &copy; 2025</p>
  </footer>
</body>
</html>`;

try {
  fs.writeFileSync('out/index.html', indexHtml);
  fs.writeFileSync('out/admin/index.html', adminHtml);
  fs.writeFileSync('out/404.html', notFoundHtml);
  console.log('Created HTML files');
} catch (error) {
  console.error('Error creating HTML files:', error);
}

// Create Netlify _redirects file for routing
console.log('Creating Netlify redirects...');
try {
  fs.writeFileSync('out/_redirects', `
# Redirect all admin paths to admin/index.html
/admin/*  /admin/index.html  200

# Handle 404
/*  /index.html  200
`);
  console.log('Created _redirects file');
} catch (error) {
  console.error('Error creating _redirects file:', error);
}

console.log('Build completed successfully!');
console.log('The fully functional static site is ready in the "out" directory'); 