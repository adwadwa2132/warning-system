'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Polygon, useMap, LayersControl, ZoomControl, Popup } from 'react-leaflet';
import React from 'react';

// Remove direct CSS imports since they're causing build issues
// import 'leaflet/dist/leaflet.css';
// import '../../styles/LeafletDrawStyles.css';

// We need to manually ensure leaflet-draw is loaded
// This ensures the L.Draw namespace is available
if (typeof window !== 'undefined') {
  // Only run on client side
  try {
    require('leaflet-draw');
    console.log("Leaflet Draw imported successfully");
  } catch (e) {
    console.error("Failed to import leaflet-draw:", e);
  }
}

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
  
  // Expose map instance globally to help custom scripts find it
  useEffect(() => {
    if (mapRef.current) {
      console.log("Exposing map instance globally");
      
      // Use type assertion to add properties to window
      (window as any)._leafletMap = mapRef.current;
      
      // Expose helper for external scripts to force draw mode
      (window as any)._startDrawingPolygon = () => {
        try {
          if (!mapRef.current) return false;
          
          console.log("External drawing request received");
          if ((L as any).Draw && (L as any).Draw.Polygon) {
            const handler = new ((L as any).Draw.Polygon)(mapRef.current, {
              shapeOptions: { color: '#f00' }
            });
            handler.enable();
            console.log("Drawing polygon through exposed helper");
            return true;
          }
          return false;
        } catch (err) {
          console.error("Error in global drawing helper:", err);
          return false;
        }
      };
    }
    
    return () => {
      // Clean up global references when component unmounts
      delete (window as any)._leafletMap;
      delete (window as any)._startDrawingPolygon;
    };
  }, [mapRef.current]);
  
  // Debug warnings data
  useEffect(() => {
    console.log("Warnings received in Map component:", warnings);
    if (warnings && warnings.length > 0) {
      console.log("First warning details:", warnings[0]);
      console.log("First warning polygon:", warnings[0].polygon);
    }
  }, [warnings]);
  
  // Define custom type for Leaflet Draw
  type LeafletWithDraw = typeof L & {
    Draw: {
      Event: {
        CREATED: string;
        EDITED: string;
        DELETED: string;
      };
      Control: any;
    };
    Control: {
      Draw: any;
    } & typeof L.Control;
  };

  // Cast L to our custom type that includes Draw
  const LeafletWithDrawing = L as LeafletWithDraw;
  
  // Initialize map when it's ready
  useEffect(() => {
    const currentMap = mapRef.current;
    if (!currentMap) return;
    
    console.log("Map instance created", currentMap);
    setMap(currentMap);
    
    // Add the editable layers to the map if in edit mode
    if (editMode) {
      console.log("Edit mode is enabled");
      
      // Create editable layer and add to map
      const editableLayer = new L.FeatureGroup();
      editableLayers.current = editableLayer;
      currentMap.addLayer(editableLayer);
      
      // Create the draw control
      const drawControl = new (L as any).Control.Draw({
        position: 'topright',
        draw: {
          polyline: false,
          rectangle: false,
          circle: false,
          circlemarker: false,
          marker: false,
          polygon: {
            allowIntersection: false,
            showArea: true,
            drawError: {
              color: '#e1e100',
              message: '<strong>Error:</strong> Polygon edges cannot cross!'
            },
            shapeOptions: {
              color: '#ff0000',
              fillOpacity: 0.2
            }
          }
        },
        edit: {
          featureGroup: editableLayer,
          remove: true
        }
      });
      
      // Add draw control to map
      currentMap.addControl(drawControl);
      setDrawControl(drawControl);
      console.log("Draw control added to map");
      
      // Add event handlers
      currentMap.on('draw:created', function(e: any) {
        console.log("Polygon created event", e);
        const layer = e.layer;
        
        // Add the layer to our editable layer
        editableLayer.addLayer(layer);
        
        // Get the polygon coordinates
        const polygonCoordinates = layer.getLatLngs()[0].map((point: any) => {
          return [point.lat, point.lng];
        });
        
        // Close the polygon by adding the first point at the end
        polygonCoordinates.push(polygonCoordinates[0]);
        
        // Format how the app expects it
        const formattedPolygon = [polygonCoordinates];
        
        if (onPolygonCreated) {
          onPolygonCreated(formattedPolygon);
        }
      });
      
      currentMap.on('draw:edited', function(e: any) {
        console.log("Polygon edited event", e);
        const layers = e.layers;
        
        // Extract all polygons
        const editedPolygon: any = [];
        layers.eachLayer(function(layer: any) {
          const polygonCoordinates = layer.getLatLngs()[0].map((point: any) => {
            return [point.lat, point.lng];
          });
          
          // Close the polygon
          polygonCoordinates.push(polygonCoordinates[0]);
          editedPolygon.push(polygonCoordinates);
        });
        
        if (onPolygonEdited && editedPolygon.length > 0) {
          onPolygonEdited(editedPolygon);
        }
      });
      
      // Clean up event handlers on unmount
      return () => {
        currentMap.off('draw:created');
        currentMap.off('draw:edited');
        if (drawControl) {
          currentMap.removeControl(drawControl);
        }
      };
    }
  }, [editMode, onPolygonCreated, onPolygonEdited]);
  
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