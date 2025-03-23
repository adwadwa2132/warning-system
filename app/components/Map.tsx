'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Polygon, useMap, LayersControl, ZoomControl, Popup } from 'react-leaflet';
import 'leaflet-draw';
import React from 'react';

// Fix for the Leaflet icon issue
function FixLeafletIcons() {
  useEffect(() => {
    // @ts-ignore
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });
  }, []);
  
  return null;
}

// Console logging component to debug map mounting
function MapDebugger() {
  const map = useMap();
  
  useEffect(() => {
    console.log("Map component successfully mounted", map);
  }, [map]);
  
  return null;
}

// Add radar product selection UI component
function RadarControls({ radarData, currentTimestamp, refreshRadar, currentProduct, setProduct }) {
  const productOptions = [
    { value: 'reflectivity', label: 'Reflectivity' },
    { value: 'precipitation', label: 'Precipitation Rate' },
    { value: 'composite', label: 'Composite Reflectivity' },
    { value: 'velocity', label: 'Base Velocity' },
    { value: 'rotation', label: 'Rotation (Tornado Detection)' },
    { value: 'hail', label: 'Hail Detection' }
  ];

  return (
    <div className="bg-white p-3 mt-3 rounded-md shadow-md border border-gray-200">
      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <div className="text-sm font-semibold">
          MRMS Radar Data
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {currentProduct && setProduct && (
            <select
              value={currentProduct}
              onChange={(e) => setProduct(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              {productOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
          
          <div className="flex items-center gap-3">
            <span className="text-xs sm:text-sm">
              {currentTimestamp ? new Date(currentTimestamp * 1000).toLocaleString() : 'Loading...'}
            </span>
            <button
              onClick={refreshRadar}
              className="px-2 py-1 bg-gray-200 rounded text-xs hover:bg-gray-300"
            >
              Refresh Radar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Map Component
export default function Map({ 
  warnings = [], 
  center = [43.6532, -79.3832],
  zoom = 8,
  showRadar = true,
  onPolygonCreated,
  onPolygonEdited,
  setRadarControls,
  editMode = false,
  onWarningClick,
  selectedWarningId,
  radarType = "rainviewer"
}) {
  // State variables
  const [map, setMap] = useState(null);
  const [selectedWarning, setSelectedWarning] = useState(null);
  const [radarData, setRadarData] = useState(null);
  const [currentTimestamp, setCurrentTimestamp] = useState(0);
  const [radarLayer, setRadarLayer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentProduct, setCurrentProduct] = useState('reflectivity');
  const drawControlRef = useRef(null);
  const [drawControl, setDrawControl] = useState(null);
  const editableLayers = useRef(new L.FeatureGroup());
  const mapRef = useRef(null);
  
  // Debug warnings data
  useEffect(() => {
    console.log("Warnings received in Map component:", warnings);
    if (warnings && warnings.length > 0) {
      console.log("First warning details:", warnings[0]);
      console.log("First warning polygon:", warnings[0].polygon);
    }
  }, [warnings]);
  
  // Initialize map when it's ready
  useEffect(() => {
    const currentMap = mapRef.current;
    if (!currentMap) return;
    
    console.log("Map instance created", currentMap);
    setMap(currentMap);
    
    // Add the editable layers to the map if in edit mode
    if (editMode) {
      console.log("Edit mode is enabled, setting up drawing tools");
      
      // First make sure we're working with the L.Draw namespace
      if (!L.Draw) {
        console.error("Leaflet Draw plugin is not available!");
        return;
      }
      
      // Add the editable layers FeatureGroup to the map
      editableLayers.current = new L.FeatureGroup();
      editableLayers.current.addTo(currentMap);
      
      // Create draw options with specific settings for polygon
      const drawOptions = {
        polyline: false as const,
        circle: false as const,
        circlemarker: false as const,
        rectangle: false as const,
        marker: false as const,
        polygon: {
          allowIntersection: false,
          drawError: {
            color: '#e1e100',
            message: 'Polygons cannot intersect!'
          },
          shapeOptions: {
            color: '#3388ff',
            weight: 2
          }
        }
      };
      
      // Create edit options
      const editOptions = {
        featureGroup: editableLayers.current,
        remove: true
      };
      
      try {
        // Create the draw control with proper options
        const control = new L.Control.Draw({
          position: 'topright',
          draw: drawOptions,
          edit: editOptions
        });
        
        // Add the control to the map
        currentMap.addControl(control);
        console.log("Draw control successfully added to map", control);
        
        // Debug: Check if the control has been added to the DOM
        setTimeout(() => {
          const drawControls = document.querySelectorAll('.leaflet-draw');
          console.log("Draw controls in DOM:", drawControls.length, drawControls);
          
          const polygonButton = document.querySelector('.leaflet-draw-draw-polygon');
          console.log("Polygon button found:", polygonButton);
        }, 500);
        
        setDrawControl(control);
        
        // Set up event handlers for drawing actions
        currentMap.on(L.Draw.Event.CREATED, handlePolygonCreated);
        currentMap.on(L.Draw.Event.EDITED, handlePolygonEdited);
        currentMap.on(L.Draw.Event.DELETED, handlePolygonDeleted);
        
        // Clean up on unmount
        return () => {
          currentMap.off(L.Draw.Event.CREATED, handlePolygonCreated);
          currentMap.off(L.Draw.Event.EDITED, handlePolygonEdited);
          currentMap.off(L.Draw.Event.DELETED, handlePolygonDeleted);
          if (control) {
            currentMap.removeControl(control);
          }
        };
      } catch (error) {
        console.error("Error setting up draw controls:", error);
      }
    }
  }, [editMode]);
  
  // Handle different radar types
  useEffect(() => {
    if (!map || !showRadar) return;
    
    if (radarType === 'rainviewer') {
      fetchRainviewerData();
    } else if (radarType === 'mrms') {
      fetchMrmsData();
    }
  }, [map, showRadar, radarType, currentProduct]);
  
  // Fetch RainViewer data
  const fetchRainviewerData = async () => {
    if (isLoading || !map) return;
    
    try {
      setIsLoading(true);
      const response = await fetch('https://api.rainviewer.com/public/weather-maps.json');
      const data = await response.json();
      console.log("Radar data successfully fetched", data);
      setRadarData(data);
      
      // Display latest frame
      if (data.radar && data.radar.past && data.radar.past.length > 0) {
        const latestFrame = data.radar.past[data.radar.past.length - 1];
        const tileUrl = latestFrame.path;
        const timestamp = latestFrame.time;
        setCurrentTimestamp(timestamp);
        
        // Remove existing layer
        if (radarLayer) {
          map.removeLayer(radarLayer);
        }
        
        // Add new layer
        const layer = L.tileLayer(`https://tilecache.rainviewer.com${tileUrl}/256/{z}/{x}/{y}/2/1_1.png`, {
          opacity: 0.6,
          zIndex: 100
        });
        
        layer.addTo(map);
        setRadarLayer(layer);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to fetch radar data:", error);
      setIsLoading(false);
    }
  };
  
  // Fetch MRMS data (for admin page)
  const fetchMrmsData = async () => {
    if (isLoading || !map) return;
    
    try {
      setIsLoading(true);
      
      // Remove existing layer
      if (radarLayer) {
        map.removeLayer(radarLayer);
      }
      
      // Product selection (URLs adjusted based on selected product)
      const products = {
        reflectivity: {
          url: 'https://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0r.cgi',
          layers: 'nexrad-n0r'
        },
        precipitation: {
          url: 'https://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0q.cgi',
          layers: 'nexrad-n0q-900913'
        },
        composite: {
          url: 'https://opengeo.ncep.noaa.gov/geoserver/conus/conus_cref_qcd/ows',
          layers: 'conus_cref_qcd'
        },
        velocity: {
          url: 'https://opengeo.ncep.noaa.gov/geoserver/conus/conus_bv_qcd/ows',
          layers: 'conus_bv_qcd'
        },
        rotation: {
          url: 'https://opengeo.ncep.noaa.gov/geoserver/conus/conus_srvel_qcd/ows',
          layers: 'conus_srvel_qcd'
        },
        hail: {
          url: 'https://opengeo.ncep.noaa.gov/geoserver/conus/conus_mh_qcd/ows',
          layers: 'conus_mh_qcd'
        }
      };
      
      const selectedProduct = products[currentProduct] || products.reflectivity;
      
      // Create WMS layer
      const layer = L.tileLayer.wms(
        selectedProduct.url,
        {
          layers: selectedProduct.layers,
          format: 'image/png',
          transparent: true,
          attribution: 'NOAA/NWS MRMS',
          opacity: 0.7,
          zIndex: 100
        }
      );
      
      // Add to map
      layer.addTo(map);
      setRadarLayer(layer);
      setCurrentTimestamp(Date.now() / 1000);
      setIsLoading(false);
      
    } catch (error) {
      console.error("Failed to fetch MRMS data:", error);
      setIsLoading(false);
    }
  };
  
  // Expose radar controls to parent components
  useEffect(() => {
    if (!setRadarControls) return;
    
    const controls = {
      refreshRadar: radarType === 'rainviewer' ? fetchRainviewerData : fetchMrmsData,
      currentTimestamp: currentTimestamp ? new Date(currentTimestamp * 1000).toLocaleString() : '',
      setProduct: setCurrentProduct,
      currentProduct
    };
    
    setRadarControls(controls);
  }, [setRadarControls, currentTimestamp, currentProduct, radarType]);
  
  // Handle polygon creation
  const handlePolygonCreated = (event) => {
    try {
      const layer = event.layer;
      editableLayers.current.addLayer(layer);
      
      // Extract polygon coordinates
      const polygon = layer.getLatLngs()[0];
      
      // Convert to [[lng, lat], [lng, lat], ...] format for GeoJSON
      const coordinates = polygon.map(point => [point.lng, point.lat]);
      
      // Close the polygon by repeating the first point
      if (coordinates.length > 0 && 
          (coordinates[0][0] !== coordinates[coordinates.length - 1][0] || 
           coordinates[0][1] !== coordinates[coordinates.length - 1][1])) {
        coordinates.push([...coordinates[0]]);
      }
      
      // Pass coordinates to the parent component in the format expected by MongoDB ([[[lng, lat], ...]])
      if (onPolygonCreated) {
        onPolygonCreated([[coordinates]]);
      }
      
      console.log("Polygon created:", coordinates);
    } catch (error) {
      console.error("Error handling polygon creation:", error);
    }
  };
  
  // Handle polygon editing
  const handlePolygonEdited = (event) => {
    try {
      const layers = event.layers;
      layers.eachLayer((layer) => {
        const polygon = layer.getLatLngs()[0];
        
        // Convert to [[lng, lat], [lng, lat], ...] format for GeoJSON
        const coordinates = polygon.map(point => [point.lng, point.lat]);
        
        // Close the polygon
        if (coordinates.length > 0 &&
            (coordinates[0][0] !== coordinates[coordinates.length - 1][0] ||
             coordinates[0][1] !== coordinates[coordinates.length - 1][1])) {
          coordinates.push([...coordinates[0]]);
        }
        
        // Pass coordinates to the parent component
        if (onPolygonEdited) {
          onPolygonEdited([[coordinates]]);
        }
        
        console.log("Polygon edited:", coordinates);
      });
    } catch (error) {
      console.error("Error handling polygon edit:", error);
    }
  };
  
  // Handle polygon deletion
  const handlePolygonDeleted = (event) => {
    try {
      console.log("Polygon deleted");
      
      // Clear the polygon data in the parent component
      if (onPolygonEdited) {
        onPolygonEdited([[]]);
      }
    } catch (error) {
      console.error("Error handling polygon deletion:", error);
    }
  };
  
  // Handle warning clicks
  const handleWarningClick = (warning) => {
    setSelectedWarning(warning);
    if (onWarningClick) {
      onWarningClick(warning);
    }
  };
  
  // Convert warning polygon data to Leaflet format
  const formatPolygonData = (polygonData): L.LatLngTuple[] => {
    if (!polygonData) {
      console.warn("Warning is missing polygon data");
      return [];
    }
    
    try {
      console.log("Raw polygon data:", JSON.stringify(polygonData).substring(0, 100));
      
      // Handle different possible polygon formats
      
      // Case 1: Direct array of coordinate pairs
      if (Array.isArray(polygonData) && polygonData.length > 0 && Array.isArray(polygonData[0])) {
        // Check if the coordinates are in the correct format [lat, lng]
        if (typeof polygonData[0][0] === 'number' && typeof polygonData[0][1] === 'number') {
          console.log("Using direct array of coordinate pairs format");
          // Ensure each coordinate is a valid LatLngTuple (exactly 2 elements)
          return polygonData.map(coord => 
            Array.isArray(coord) && coord.length >= 2 
              ? [coord[0], coord[1]] as L.LatLngTuple 
              : [0, 0] as L.LatLngTuple
          );
        }
      }
      
      // Case 2: GeoJSON format - most likely format from MongoDB
      if (typeof polygonData === 'object' && polygonData !== null) {
        // Standard GeoJSON polygon
        if (polygonData.type === 'Polygon' && Array.isArray(polygonData.coordinates)) {
          console.log("Using GeoJSON Polygon format");
          // Convert from [lng, lat] to [lat, lng] format for Leaflet
          return polygonData.coordinates[0].map(coord => 
            Array.isArray(coord) && coord.length >= 2 
              ? [coord[1], coord[0]] as L.LatLngTuple 
              : [0, 0] as L.LatLngTuple
          );
        }
        
        // Just the coordinates array from a GeoJSON
        if (Array.isArray(polygonData.coordinates)) {
          console.log("Using object with coordinates property");
          // Check if it's a nested array of coordinates
          if (Array.isArray(polygonData.coordinates[0]) && 
              Array.isArray(polygonData.coordinates[0][0])) {
            // Convert from [lng, lat] to [lat, lng] format for Leaflet
            return polygonData.coordinates[0].map(coord => 
              Array.isArray(coord) && coord.length >= 2 
                ? [coord[1], coord[0]] as L.LatLngTuple 
                : [0, 0] as L.LatLngTuple
            );
          }
          
          // Single ring of coordinates
          if (Array.isArray(polygonData.coordinates[0]) && 
              typeof polygonData.coordinates[0][0] === 'number') {
            // Convert from [lng, lat] to [lat, lng] format for Leaflet
            return polygonData.coordinates.map(coord => 
              Array.isArray(coord) && coord.length >= 2 
                ? [coord[1], coord[0]] as L.LatLngTuple 
                : [0, 0] as L.LatLngTuple
            );
          }
        }
      }
      
      console.warn("Unrecognized polygon data format:", typeof polygonData);
      return [];
    } catch (error) {
      console.error("Error formatting polygon data:", error);
      return [];
    }
  };
  
  return (
    <div style={{ height: '100%', width: '100%' }}>
      <FixLeafletIcons />
      
      <MapContainer
        center={center as [number, number]}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        ref={(map) => {
          if (map) {
            mapRef.current = map;
          }
        }}
        zoomControl={false}
      >
        <MapDebugger />
        <ZoomControl position="bottomright" />
        
        <LayersControl position="bottomleft">
          <LayersControl.BaseLayer name="OpenStreetMap" checked>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Satellite">
            <TileLayer
              attribution='&copy; <a href="https://www.mapbox.com/">Mapbox</a>'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>
        </LayersControl>
        
        {/* Render warning polygons */}
        {warnings && warnings.map((warning) => {
          const polygon = formatPolygonData(warning.polygon);
          if (polygon.length === 0) return null;
          
          return (
            <Polygon
              key={warning._id}
              positions={polygon}
              pathOptions={{
                color: warning.color || '#3388ff',
                weight: 2,
                fillOpacity: 0.3,
                opacity: 0.8,
                fillColor: warning.color || '#3388ff'
              }}
              eventHandlers={{
                click: () => handleWarningClick(warning),
                mouseover: (e) => {
                  const layer = e.target;
                  layer.setStyle({
                    weight: 4,
                    fillOpacity: 0.5,
                  });
                },
                mouseout: (e) => {
                  const layer = e.target;
                  layer.setStyle({
                    weight: 2,
                    fillOpacity: 0.3,
                  });
                }
              }}
            >
              <Popup>
                <div className="warning-popup">
                  <h3>{warning.title}</h3>
                  <p><strong>Severity:</strong> {warning.severity || 'Not specified'}</p>
                  <p><strong>Expires:</strong> {new Date(warning.expiresAt).toLocaleString()}</p>
                  <p>{warning.context}</p>
                </div>
              </Popup>
            </Polygon>
          );
        })}
      </MapContainer>
      
      {/* Render radar controls below map if needed and in MRMS mode */}
      {showRadar && radarType === 'mrms' && (
        <RadarControls 
          radarData={radarData} 
          currentTimestamp={currentTimestamp} 
          refreshRadar={fetchMrmsData}
          currentProduct={currentProduct}
          setProduct={setCurrentProduct}
        />
      )}
    </div>
  );
} 