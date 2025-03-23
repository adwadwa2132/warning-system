'use client';

import { useEffect } from 'react';

export default function LeafletDrawStyles() {
  useEffect(() => {
    // Directly inject CSS for Leaflet
    const leafletStyle = document.createElement('link');
    leafletStyle.rel = 'stylesheet';
    leafletStyle.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    leafletStyle.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    leafletStyle.crossOrigin = '';
    
    // Directly inject CSS for Leaflet-draw
    const leafletDrawStyle = document.createElement('link');
    leafletDrawStyle.rel = 'stylesheet';
    leafletDrawStyle.href = 'https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.css';
    
    document.head.appendChild(leafletStyle);
    document.head.appendChild(leafletDrawStyle);
    
    return () => {
      document.head.removeChild(leafletStyle);
      document.head.removeChild(leafletDrawStyle);
    };
  }, []);
  
  return null;
} 