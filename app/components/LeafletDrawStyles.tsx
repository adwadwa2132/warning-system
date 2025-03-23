'use client';

import { useEffect } from 'react';

export default function LeafletDrawStyles() {
  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;

    // Check if links already exist to avoid duplicates
    const existingLeafletCss = document.querySelector('link[href*="leaflet.css"]');
    const existingLeafletDrawCss = document.querySelector('link[href*="leaflet.draw.css"]');
    
    // Only add if not already present
    if (!existingLeafletCss) {
      const leafletStyle = document.createElement('link');
      leafletStyle.rel = 'stylesheet';
      leafletStyle.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      leafletStyle.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      leafletStyle.crossOrigin = '';
      document.head.appendChild(leafletStyle);
    }
    
    if (!existingLeafletDrawCss) {
      const leafletDrawStyle = document.createElement('link');
      leafletDrawStyle.rel = 'stylesheet';
      leafletDrawStyle.href = 'https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.css';
      document.head.appendChild(leafletDrawStyle);
    }
    
    // Load sprite image in advance to ensure it's available
    const spriteImage = new Image();
    spriteImage.src = 'https://unpkg.com/leaflet-draw@1.0.4/dist/images/spritesheet.png';
    
    // Inject additional CSS to fix missing sprite icons
    const style = document.createElement('style');
    style.textContent = `
      .leaflet-draw-toolbar a {
        background-image: url('https://unpkg.com/leaflet-draw@1.0.4/dist/images/spritesheet.png');
        background-repeat: no-repeat;
      }
      
      .leaflet-draw-toolbar a.leaflet-draw-draw-polygon {
        background-position: -31px -2px;
      }
      
      .leaflet-draw-actions a {
        background: #919187;
        color: #fff;
        font-size: 12px;
        line-height: 30px;
        height: 30px;
        padding: 0 10px;
        text-decoration: none;
        border-radius: 4px;
      }
      
      .leaflet-container {
        height: 100%;
        width: 100%;
      }
    `;
    document.head.appendChild(style);
    
    // Clean up function
    return () => {
      if (!existingLeafletCss) {
        const leafletCss = document.querySelector('link[href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"]');
        if (leafletCss) document.head.removeChild(leafletCss);
      }
      
      if (!existingLeafletDrawCss) {
        const leafletDrawCss = document.querySelector('link[href="https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.css"]');
        if (leafletDrawCss) document.head.removeChild(leafletDrawCss);
      }
      
      const injectedStyle = document.querySelector('style');
      if (injectedStyle) document.head.removeChild(injectedStyle);
    };
  }, []);
  
  return null;
} 