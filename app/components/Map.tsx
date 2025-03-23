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
  // Debug warnings data
  useEffect(() => {
    console.log("Warnings received in Map component:", warnings);
    if (warnings && warnings.length > 0) {
      console.log("First warning details:", warnings[0]);
      console.log("First warning polygon:", warnings[0].polygon);
    }
  }, [warnings]);
  
  // State variables
  const [map, setMap] = useState(null);
  const [selectedWarning, setSelectedWarning] = useState(null);
  const [radarData, setRadarData] = useState(null);
  const [currentTimestamp, setCurrentTimestamp] = useState(0);
  const [radarLayer, setRadarLayer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const drawControlRef = useRef(null);
  const [drawControl, setDrawControl] = useState(null);
  const editableLayers = useRef(new L.FeatureGroup());
  
  // Set up the map instance when component mounts
  const onMapCreated = useCallback((mapInstance) => {
    console.log("Map instance created", mapInstance);
    setMap(mapInstance);
    
    // Add the editable layers to the map if in edit mode
    if (editMode) {
      editableLayers.current.addTo(mapInstance);
    }
  }, [editMode]);
  
  // Initialize draw controls when map is ready and in edit mode
  useEffect(() => {
    if (!map || !editMode) return;
    
    console.log("Initializing draw controls");
    
    // Create the draw control
    const drawControlOptions = {
      position: 'topright',
      draw: {
        polyline: false,
        circle: false,
        circlemarker: false,
        rectangle: false,
        marker: false,
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
      },
      edit: {
        featureGroup: editableLayers.current,
        remove: true
      }
    };
    
    try {
      // Create the draw control
      // @ts-ignore
      const control = new L.Control.Draw(drawControlOptions);
      map.addControl(control);
      setDrawControl(control);
      
      console.log("Draw control added to map");
      
      // Setup event handlers for draw/edit events
      map.on(L.Draw.Event.CREATED, handlePolygonCreated);
      map.on(L.Draw.Event.EDITED, handlePolygonEdited);
      
      return () => {
        map.off(L.Draw.Event.CREATED, handlePolygonCreated);
        map.off(L.Draw.Event.EDITED, handlePolygonEdited);
        if (control) {
          map.removeControl(control);
        }
      };
    } catch (error) {
      console.error("Error setting up draw controls:", error);
    }
  }, [map, editMode, onPolygonCreated, onPolygonEdited]);
  
  // Fetch the radar data from RainViewer API - only once initially with manual refresh
  useEffect(() => {
    // Avoid refetching if we already have data or are currently loading
    if (radarData || isLoading) return;
    
    fetchRadarData();
  }, [radarData, isLoading]);

  // Fetch radar data and display the latest frame
  const fetchRadarData = async () => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      const response = await fetch('https://api.rainviewer.com/public/weather-maps.json');
      const data = await response.json();
      console.log("Radar data successfully fetched", data);
      setRadarData(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to fetch radar data:", error);
      setIsLoading(false);
    }
  };
  
  // Expose radar controls to parent components (simplified)
  useEffect(() => {
    if (radarData && setRadarControls) {
      setRadarControls({
        refreshRadar: fetchRadarData,
        currentTimestamp
      });
    }
  }, [setRadarControls, radarData, currentTimestamp]);
  
  // Show latest radar frame when data is loaded
  useEffect(() => {
    if (!radarData || !map) return;
    
    // Clear existing layer if any
    if (radarLayer) {
      map.removeLayer(radarLayer);
    }
    
    // Add latest radar data
    if (showRadar) {
      try {
        // Get the radar frames
        const { radar } = radarData;
        if (!radar || !radar.past || !radar.past.length) {
          console.log("No radar data available");
          return;
        }
        
        // Use the most recent past frame
        const latestFrame = radar.past[radar.past.length - 1];
        const tileUrl = latestFrame.path;
        const timestamp = latestFrame.time;
        
        // Set current timestamp
        setCurrentTimestamp(timestamp);
        
        // Create the tile layer
        const layer = L.tileLayer(`https://tilecache.rainviewer.com${tileUrl}/256/{z}/{x}/{y}/2/1_1.png`, {
          opacity: 0.6,
          zIndex: 100
        });
        
        // Add the layer to the map
        layer.addTo(map);
        setRadarLayer(layer);
        console.log("Radar layer added to map");
      } catch (error) {
        console.error("Error displaying radar data:", error);
      }
    }
  }, [map, radarData, showRadar]);
  
  // Handle polygon creation
  const handlePolygonCreated = (event) => {
    try {
      const layer = event.layer;
      editableLayers.current.addLayer(layer);
      
      // Extract polygon coordinates
      const polygon = layer.getLatLngs()[0];
      const coordinates = polygon.map(point => [point.lat, point.lng]);
      
      // Pass coordinates to the parent component
      if (onPolygonCreated) {
        onPolygonCreated(coordinates);
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
        const coordinates = polygon.map(point => [point.lat, point.lng]);
        
        // Pass coordinates to the parent component
        if (onPolygonEdited) {
          onPolygonEdited(coordinates);
        }
        
        console.log("Polygon edited:", coordinates);
      });
    } catch (error) {
      console.error("Error handling polygon edit:", error);
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
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        whenCreated={onMapCreated}
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
    </div>
  );
} 