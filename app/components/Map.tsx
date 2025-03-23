'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Polygon, useMap, LayersControl, ZoomControl, Popup } from 'react-leaflet';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
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

// Add some basic styles for leaflet-draw that would normally come from the CSS file
const LeafletDrawStyles = () => {
  return (
    <style jsx global>{`
      .leaflet-draw-toolbar a {
        background-image: url('https://unpkg.com/leaflet-draw@1.0.4/dist/images/spritesheet.png');
        background-repeat: no-repeat;
      }
      
      .leaflet-draw-toolbar a.leaflet-draw-draw-polygon {
        background-position: -31px -2px;
      }
      
      .leaflet-draw-toolbar a.leaflet-draw-edit-edit {
        background-position: -152px -2px;
      }
      
      .leaflet-draw-toolbar a.leaflet-draw-edit-remove {
        background-position: -182px -2px;
      }
      
      .leaflet-draw-tooltip {
        background: rgba(255, 255, 255, 0.8);
        border: 1px solid #999;
        border-radius: 4px;
        color: #222;
        font: 12px/18px "Helvetica Neue", Arial, Helvetica, sans-serif;
        margin-left: 20px;
        margin-top: -21px;
        padding: 4px 8px;
        position: absolute;
        white-space: nowrap;
        z-index: 1000;
      }
      
      .leaflet-draw-actions {
        list-style: none;
        margin: 0;
        padding: 0;
        position: absolute;
        left: 26px;
        top: 0;
        white-space: nowrap;
      }
      
      .leaflet-touch .leaflet-draw-toolbar .leaflet-draw-draw-polygon {
        background-position: -31px -1px;
      }
    `}</style>
  );
}

interface RadarControls {
  refreshRadar: () => Promise<void>;
  currentTimestamp: string;
  setProduct?: (product: string) => void;
  currentProduct?: string;
}

// Type for radar source selection
type RadarType = 'rainviewer' | 'mrms';

// Original RainViewer radar implementation for the main page
function RainViewerLayer({ 
  radarControls, 
  setRadarControls 
}: { 
  radarControls: RadarControls | null;
  setRadarControls: (controls: RadarControls) => void;
}) {
  const map = useMap();
  const [radarLayer, setRadarLayer] = useState<L.TileLayer | null>(null);
  const [radarData, setRadarData] = useState<any>(null);
  const [currentTimestamp, setCurrentTimestamp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
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
      setRadarData(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to fetch radar data:", error);
      setIsLoading(false);
    }
  };
  
  // Expose radar controls to parent components (simplified)
  useEffect(() => {
    if (radarData) {
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
    
    // Get the latest radar frame (last item in the past array)
    const pastFrames = radarData.radar.past;
    if (!pastFrames || pastFrames.length === 0) return;
    
    const latestFrame = pastFrames[pastFrames.length - 1];
    if (!latestFrame) return;
    
    // Format timestamp for display
    const date = new Date(latestFrame.time * 1000);
    setCurrentTimestamp(date.toLocaleString());
    
    // Create radar layer with the latest frame
    const newRadarLayer = L.tileLayer(
      radarData.host + latestFrame.path + '/256/{z}/{x}/{y}/6/1_1.png', 
      {
        opacity: 0.6,
        zIndex: 50
      }
    );
    
    // Add to map
    newRadarLayer.addTo(map);
    setRadarLayer(newRadarLayer);
    
    return () => {
      if (newRadarLayer && map) {
        map.removeLayer(newRadarLayer);
      }
    };
  }, [map, radarData]);
  
  return null;
}

// MRMS radar implementation with multiple products for the admin page
function MrmsRadarLayer({ 
  radarControls, 
  setRadarControls 
}: { 
  radarControls: RadarControls | null;
  setRadarControls: (controls: RadarControls) => void;
}) {
  const map = useMap();
  const [radarLayer, setRadarLayer] = useState<L.TileLayer | null>(null);
  const [currentTimestamp, setCurrentTimestamp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<string>('reflectivity');
  
  // Product definitions for MRMS data with enhanced options
  const mrmsProducts = {
    reflectivity: {
      name: 'Radar Reflectivity',
      url: 'https://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0r.cgi',
      layers: 'nexrad-n0r',
      attribution: 'NOAA/NWS MRMS',
      transparent: true,
      format: 'image/png'
    },
    precipitation: {
      name: 'Precipitation Rate',
      url: 'https://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0q.cgi',
      layers: 'nexrad-n0q-900913',
      attribution: 'NOAA/NWS MRMS',
      transparent: true,
      format: 'image/png'
    },
    composite: {
      name: 'Composite Reflectivity',
      url: 'https://opengeo.ncep.noaa.gov/geoserver/conus/conus_cref_qcd/ows',
      layers: 'conus_cref_qcd',
      attribution: 'NOAA/NWS MRMS',
      transparent: true,
      format: 'image/png'
    },
    velocity: {
      name: 'Base Velocity',
      url: 'https://opengeo.ncep.noaa.gov/geoserver/conus/conus_bv_qcd/ows',
      layers: 'conus_bv_qcd',
      attribution: 'NOAA/NWS MRMS',
      transparent: true,
      format: 'image/png'
    },
    rotation: {
      name: 'Rotation (Tornado Detection)',
      url: 'https://opengeo.ncep.noaa.gov/geoserver/conus/conus_srvel_qcd/ows',
      layers: 'conus_srvel_qcd',
      attribution: 'NOAA/NWS MRMS',
      transparent: true,
      format: 'image/png'
    },
    hail: {
      name: 'Hail Detection',
      url: 'https://opengeo.ncep.noaa.gov/geoserver/conus/conus_mh_qcd/ows',
      layers: 'conus_mh_qcd',
      attribution: 'NOAA/NWS MRMS',
      transparent: true,
      format: 'image/png'
    }
  };
  
  // Update radar when product changes
  useEffect(() => {
    if (map) {
      updateRadarLayer();
    }
  }, [map, currentProduct]);
  
  // Fetch the radar data and create layer
  const updateRadarLayer = async () => {
    if (isLoading || !map) return;
    
    try {
      setIsLoading(true);
      
      // Clear existing layer if any
      if (radarLayer) {
        map.removeLayer(radarLayer);
      }
      
      // Get current product configuration
      const product = mrmsProducts[currentProduct as keyof typeof mrmsProducts];
      
      // Create WMS layer for the selected MRMS product
      const newRadarLayer = L.tileLayer.wms(
        product.url, 
        {
          layers: product.layers,
          format: product.format,
          transparent: product.transparent,
          attribution: product.attribution,
          opacity: 0.7,
          zIndex: 50
        }
      );
      
      // Add to map
      newRadarLayer.addTo(map);
      setRadarLayer(newRadarLayer);
      
      // Update timestamp
      const now = new Date();
      setCurrentTimestamp(now.toLocaleString());
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to update radar data:", error);
      setIsLoading(false);
    }
  };
  
  // Expose radar controls to parent components
  useEffect(() => {
    setRadarControls({
      refreshRadar: updateRadarLayer,
      currentTimestamp,
      setProduct: (product: string) => setCurrentProduct(product),
      currentProduct
    });
  }, [setRadarControls, currentTimestamp, currentProduct]);
  
  // Initial load
  useEffect(() => {
    updateRadarLayer();
    
    // Cleanup on unmount
    return () => {
      if (radarLayer && map) {
        map.removeLayer(radarLayer);
      }
    };
  }, []);
  
  return null;
}

interface MapProps {
  center?: [number, number];
  zoom?: number;
  warnings?: any[];
  editable?: boolean;
  onPolygonCreated?: (polygon: number[][][]) => void;
  showRadar?: boolean;
  radarType?: RadarType;
}

export default function Map({ 
  warnings, 
  onPolygonCreated, 
  editable = false, 
  center = [43.6532, -79.3832], 
  zoom = 8,
  showRadar = true,
  radarType = 'rainviewer'
}: {
  warnings: any[];
  onPolygonCreated?: (polygon: number[][][]) => void;
  editable?: boolean;
  center?: [number, number];
  zoom?: number;
  showRadar?: boolean;
  radarType?: RadarType;
}) {
  const [radarControls, setRadarControls] = useState<RadarControls | null>(null);
  
  return (
    <div className="flex flex-col relative">
      <div className="h-[400px] sm:h-[600px] w-full">
        <MapContainer 
          center={center} 
          zoom={zoom} 
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <ZoomControl position="topright" />
          <FixLeafletIcons />
          <LeafletDrawStyles />
          
          <MapContent 
            warnings={warnings} 
            onPolygonCreated={onPolygonCreated} 
            editable={editable}
            showRadar={showRadar}
            radarType={radarType}
            setRadarControls={setRadarControls}
          />
          
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="OpenStreetMap">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            </LayersControl.BaseLayer>
            
            <LayersControl.BaseLayer name="Satellite">
              <TileLayer
                attribution='&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
            </LayersControl.BaseLayer>
            
            <LayersControl.Overlay checked={showRadar} name="Weather Radar">
              {showRadar && (
                <>
                  {radarType === 'rainviewer' && <RainViewerLayer radarControls={radarControls} setRadarControls={setRadarControls} />}
                  {radarType === 'mrms' && <MrmsRadarLayer radarControls={radarControls} setRadarControls={setRadarControls} />}
                </>
              )}
            </LayersControl.Overlay>
          </LayersControl>
          
        </MapContainer>
      </div>
      
      {/* Radar Controls - Adapt UI based on radar type */}
      {showRadar && radarControls && (
        <div className="bg-white p-3 mt-3 mb-12 rounded-md shadow-md border border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <div className="text-sm font-semibold">
              {radarType === 'mrms' ? 'MRMS Radar Data' : 'Radar Data'}
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              {/* Product selection for MRMS only */}
              {radarType === 'mrms' && radarControls.setProduct && radarControls.currentProduct && (
                <select
                  value={radarControls.currentProduct}
                  onChange={(e) => {
                    if (radarControls.setProduct) {
                      radarControls.setProduct(e.target.value);
                    }
                  }}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="reflectivity">Reflectivity</option>
                  <option value="precipitation">Precipitation Rate</option>
                  <option value="composite">Composite Reflectivity</option>
                  <option value="velocity">Base Velocity</option>
                  <option value="rotation">Rotation (Tornado Detection)</option>
                  <option value="hail">Hail Detection</option>
                </select>
              )}
              
              <div className="flex items-center gap-3">
                <span className="text-xs sm:text-sm">{radarControls.currentTimestamp}</span>
                <button
                  onClick={() => radarControls.refreshRadar()}
                  className="px-2 py-1 bg-gray-200 rounded text-xs hover:bg-gray-300"
                >
                  Refresh Radar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Inner component that has access to the map context
function MapContent({ 
  warnings, 
  onPolygonCreated, 
  editable, 
  showRadar,
  radarType,
  setRadarControls
}: { 
  warnings: any[]; 
  onPolygonCreated?: (polygon: number[][][]) => void; 
  editable: boolean;
  showRadar: boolean;
  radarType: RadarType;
  setRadarControls: (controls: RadarControls) => void;
}) {
  const map = useMap();
  // Track if the control setup has been completed to avoid multiple controls
  const setupCompletedRef = useRef(false);
  // Use any type to avoid TypeScript errors with leaflet-draw
  const [drawControl, setDrawControl] = useState<any>(null);
  // Create a ref to store warning layers for cleanup
  const warningLayersRef = useRef<L.Polygon[]>([]);
  
  // Display all warnings on the map
  useEffect(() => {
    if (!map || !warnings || warnings.length === 0) return;

    console.log('Got warnings to display:', warnings);

    // Clear existing warning layers
    if (warningLayersRef.current) {
      warningLayersRef.current.forEach(layer => {
        map.removeLayer(layer);
      });
    }
    
    warningLayersRef.current = [];
    
    // Create layers for each warning
    const newWarningLayers: L.Polygon[] = [];

    warnings.forEach(warning => {
      try {
        console.log('Processing warning:', warning);
        
        // Check if polygon exists
        if (!warning.polygon) {
          console.warn('Warning is missing polygon data:', warning);
          return;
        }
        
        let polygonData = null;
        
        // Log the type and structure of polygon data for debugging
        console.log('Polygon type:', typeof warning.polygon, 'Structure:', JSON.stringify(warning.polygon).substring(0, 100));
        
        // Handle different possible polygon formats from the database
        if (typeof warning.polygon === 'object') {
          // Case 1: Standard GeoJSON format from MongoDB
          if (warning.polygon.type === 'Polygon' && warning.polygon.coordinates) {
            polygonData = warning.polygon.coordinates[0].map((coord: number[]) => [coord[1], coord[0]]);
            console.log('Extracted from GeoJSON with type property:', polygonData);
          }
          // Case 2: Object with coordinates array
          else if (warning.polygon.coordinates && Array.isArray(warning.polygon.coordinates)) {
            if (Array.isArray(warning.polygon.coordinates[0]) && Array.isArray(warning.polygon.coordinates[0][0])) {
              // Format: [[[lon, lat], [lon, lat], ...]]
              polygonData = warning.polygon.coordinates[0].map((coord: number[]) => [coord[1], coord[0]]);
              console.log('Extracted from nested coordinates array:', polygonData);
            } 
            else if (Array.isArray(warning.polygon.coordinates[0]) && typeof warning.polygon.coordinates[0][0] === 'number') {
              // Format: [[lon, lat], [lon, lat], ...]
              polygonData = warning.polygon.coordinates.map((coord: number[]) => [coord[1], coord[0]]);
              console.log('Extracted from flat coordinates array:', polygonData);
            }
          }
        }
        // Case 3: Direct array format
        else if (Array.isArray(warning.polygon)) {
          // Check if it's a nested array of arrays with first element being an array
          if (Array.isArray(warning.polygon[0]) && Array.isArray(warning.polygon[0][0])) {
            // Format: [[[lon, lat], [lon, lat], ...]]
            polygonData = warning.polygon[0].map((coord: number[]) => [coord[1], coord[0]]);
            console.log('Extracted from nested polygon array:', polygonData);
          }
          // Check if it's a simple array of coordinates
          else if (Array.isArray(warning.polygon[0]) && typeof warning.polygon[0][0] === 'number') {
            // Format: [[lon, lat], [lon, lat], ...]
            polygonData = warning.polygon.map((coord: number[]) => [coord[1], coord[0]]);
            console.log('Extracted from direct array format:', polygonData);
          }
        }
        
        // Additional fallback: try parsing if it's a string
        if (!polygonData && typeof warning.polygon === 'string') {
          try {
            const parsed = JSON.parse(warning.polygon);
            if (Array.isArray(parsed)) {
              polygonData = parsed.map((coord: number[]) => [coord[1], coord[0]]);
              console.log('Extracted from parsed string:', polygonData);
            }
          } catch (e) {
            console.warn('Failed to parse polygon string:', e);
          }
        }
        
        if (!polygonData || polygonData.length === 0) {
          console.warn('Could not extract valid polygon data:', warning.polygon);
          return;
        }
        
        // Create a polygon for the warning
        const polygon = L.polygon(polygonData, {
          color: warning.color || '#FF0000',
          fillOpacity: 0.2,
          weight: 2
        });
        
        // Add a popup with warning information
        polygon.bindPopup(`
          <div class="warning-popup">
            <h3 class="text-lg font-bold">${warning.title}</h3>
            <div class="my-2">${warning.context.substring(0, 150)}${warning.context.length > 150 ? '...' : ''}</div>
            <div class="text-xs text-gray-600">
              Severity: ${warning.severity || 'medium'}<br>
              Expires: ${new Date(warning.expiresAt).toLocaleString()}
            </div>
          </div>
        `);
        
        // Add the polygon to the map
        polygon.addTo(map);
        newWarningLayers.push(polygon);
      } catch (error) {
        console.error('Error creating warning polygon:', error, warning);
      }
    });

    // Store the new layers
    warningLayersRef.current = newWarningLayers;

    // Clean up when component unmounts
    return () => {
      if (map) {
        newWarningLayers.forEach(layer => {
          map.removeLayer(layer);
        });
      }
    };
  }, [map, warnings]);

  return (
    <>
      {editable && <DrawControl onPolygonCreated={onPolygonCreated} />}
    </>
  );
}

interface DrawControlProps {
  onPolygonCreated?: (polygon: number[][][]) => void;
}

// Custom control for drawing on the map
const DrawControl = ({ onPolygonCreated }: DrawControlProps) => {
  const map = useMap();
  // Use any type to avoid TypeScript errors with leaflet-draw
  const [drawControl, setDrawControl] = useState<any>(null);
  const [drawnItems, setDrawnItems] = useState<L.FeatureGroup | null>(null);
  
  // Use a ref to track if setup has been completed to prevent multiple initializations
  const setupCompleted = React.useRef(false);
  
  useEffect(() => {
    if (!map || !onPolygonCreated || setupCompleted.current) return;
    
    // Ensure leaflet-draw is loaded on the client side
    const setupDraw = async () => {
      try {
        // Import leaflet-draw dynamically
        await import('leaflet-draw');
        
        // Remove any existing draw controls first (in case of re-renders)
        map.eachLayer((layer) => {
          // Use a custom property to identify our drawn layers
          // @ts-ignore - Adding custom property
          if (layer instanceof L.FeatureGroup && layer._drawnItems === true) {
            map.removeLayer(layer);
          }
        });
        
        // Find and remove any existing draw controls
        // @ts-ignore - Accessing internal Leaflet properties
        const controlCorners = map._controlCorners as Record<string, HTMLElement>;
        Object.keys(controlCorners).forEach(corner => {
          const container = controlCorners[corner];
          Array.from(container.children).forEach((child: Element) => {
            if (child.className.includes('leaflet-draw')) {
              container.removeChild(child);
            }
          });
        });
        
        // Create a feature group for drawn items
        const newDrawnItems = new L.FeatureGroup();
        // @ts-ignore - Adding custom property
        newDrawnItems._drawnItems = true; // Mark this layer for identification
        map.addLayer(newDrawnItems);
        setDrawnItems(newDrawnItems);
        
        // Create the draw control with the feature group
        // @ts-ignore - Using L.Control.Draw which may not be properly typed
        const newDrawControl = new L.Control.Draw({
          // @ts-ignore - position property may cause type error
          position: 'topright',
          draw: {
            rectangle: false,
            circle: false,
            circlemarker: false,
            marker: false,
            polyline: false,
            polygon: {
              allowIntersection: false,
              showArea: true
            }
          },
          edit: {
            featureGroup: newDrawnItems,
            remove: true
          }
        });
        
        map.addControl(newDrawControl);
        setDrawControl(newDrawControl);
        
        // Handle created polygons
        // @ts-ignore - L.Draw.Event may not be properly typed
        map.on(L.Draw.Event.CREATED, (e: any) => {
          const layer = e.layer;
          newDrawnItems.addLayer(layer);
          
          // Convert Leaflet LatLngs to GeoJSON coordinates
          const latLngs = layer.getLatLngs()[0];
          const coordinates = latLngs.map((latLng: L.LatLng) => [latLng.lng, latLng.lat]);
          
          // Close the polygon by repeating the first point
          coordinates.push([...coordinates[0]]);
          
          // Call the callback with GeoJSON polygon format
          onPolygonCreated([[coordinates]]);
        });
        
        setupCompleted.current = true;
      } catch (error) {
        console.error('Error setting up draw control:', error);
      }
    };
    
    setupDraw();
    
    // Clean up function
    return () => {
      if (map && drawControl) {
        // @ts-ignore - Leaflet typings aren't complete
        map.removeControl(drawControl);
      }
      
      // @ts-ignore - L.Draw not recognized in TypeScript
      if (map && L.Draw && L.Draw.Event) {
        // @ts-ignore - L.Draw.Event may not be properly typed
        map.off(L.Draw.Event.CREATED);
      }
    };
  }, [map, onPolygonCreated]);
  
  return null;
}; 