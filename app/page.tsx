'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

// Dynamically import the Map component to avoid SSR issues with Leaflet
const Map = dynamic(() => import('./components/Map'), {
  loading: () => <p>Loading Map...</p>,
  ssr: false,
});

export default function Home() {
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showRadar, setShowRadar] = useState(true);
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  
  useEffect(() => {
    // Fetch warnings when the component mounts
    fetchWarnings();
    
    // Check for warning ID in URL
    const urlParams = new URLSearchParams(window.location.search);
    const warningId = urlParams.get('warningId');
    
    if (warningId) {
      // If there's a warning ID in the URL, we'll highlight it later when warnings are loaded
      console.log('Shared warning ID found:', warningId);
    }
    
    // Remove the automatic polling interval
    // No longer refreshing every minute
  }, []);
  
  // Highlight a specific warning if it's in the URL
  useEffect(() => {
    if (warnings.length > 0) {
      const urlParams = new URLSearchParams(window.location.search);
      const warningId = urlParams.get('warningId');
      
      if (warningId) {
        // Find the warning in our list
        const sharedWarning = warnings.find((w: any) => w._id === warningId);
        
        if (sharedWarning) {
          // Set the severity filter to show this warning
          setSeverityFilter('all');
          
          // Scroll to the warning in the list
          setTimeout(() => {
            const warningElement = document.getElementById(`warning-${warningId}`);
            if (warningElement) {
              warningElement.scrollIntoView({ behavior: 'smooth' });
              warningElement.classList.add('highlight-warning');
              
              // Remove highlight after 2 seconds
              setTimeout(() => {
                warningElement.classList.remove('highlight-warning');
              }, 2000);
            }
          }, 500);
        }
      }
    }
  }, [warnings]);
  
  // Filter warnings based on severity
  const filteredWarnings = warnings.filter((warning: any) => {
    if (severityFilter === 'all') return true;
    return warning.severity === severityFilter;
  });
  
  const fetchWarnings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/warnings');
      
      if (!response.ok) {
        throw new Error('Failed to fetch warnings');
      }
      
      const data = await response.json();
      console.log('Fetched warnings data structure:', data);
      setWarnings(data);
      setError('');
    } catch (error) {
      console.error('Error fetching warnings:', error);
      setError('Failed to load warnings. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Add manual refresh button
  const handleRefresh = () => {
    fetchWarnings();
  };
  
  return (
    <main className="min-h-screen p-2 sm:p-4">
      <div className="container mx-auto">
        <header className="mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold">Warning System</h1>
          <div className="flex gap-2 w-full sm:w-auto">
            <button 
              onClick={handleRefresh} 
              className="bg-gray-200 text-gray-800 px-3 sm:px-4 py-2 rounded hover:bg-gray-300 text-sm sm:text-base flex-1 sm:flex-none"
            >
              Refresh Warnings
            </button>
          </div>
        </header>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-3 sm:p-4 mb-4 sm:mb-6 rounded text-sm sm:text-base">
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="text-center py-8 sm:py-10">
            <p className="text-base sm:text-lg">Loading warnings...</p>
          </div>
        ) : warnings.length === 0 ? (
          <div className="bg-green-100 text-green-800 p-4 sm:p-6 rounded text-center">
            <h2 className="text-xl sm:text-2xl font-semibold mb-2">No Active Warnings</h2>
            <p className="text-sm sm:text-base">There are currently no active warnings in the system.</p>
          </div>
        ) : filteredWarnings.length === 0 ? (
          <div>
            <div className="bg-yellow-100 text-yellow-800 p-4 sm:p-6 rounded text-center mb-4">
              <h2 className="text-xl sm:text-2xl font-semibold mb-2">No Warnings Match Filter</h2>
              <p className="text-sm sm:text-base mb-3">There are no warnings with the selected severity level.</p>
              <button
                onClick={() => setSeverityFilter('all')}
                className="bg-yellow-200 hover:bg-yellow-300 text-yellow-800 px-4 py-2 rounded text-sm"
              >
                Show All Warnings
              </button>
            </div>
            <div className="h-[400px] sm:h-[600px] w-full">
              <Map 
                warnings={[]} 
                center={[43.6532, -79.3832]} 
                zoom={8}
                showRadar={showRadar}
                radarType="rainviewer"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white p-3 sm:p-4 rounded shadow-md">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
                <h2 className="text-lg sm:text-xl font-semibold">Active Warning Areas</h2>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:space-x-4">
                  {/* Severity filter */}
                  <div className="flex items-center">
                    <label htmlFor="severityFilter" className="text-sm text-gray-700 mr-2">
                      Filter by severity:
                    </label>
                    <select
                      id="severityFilter"
                      value={severityFilter}
                      onChange={(e) => setSeverityFilter(e.target.value)}
                      className="text-sm border border-gray-300 rounded px-2 py-1 flex-grow"
                    >
                      <option value="all">All warnings</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="severe">Severe</option>
                    </select>
                    {/* Add clear filter button that's visible when a filter is active */}
                    {severityFilter !== 'all' && (
                      <button
                        onClick={() => setSeverityFilter('all')}
                        className="ml-2 text-xs bg-gray-200 hover:bg-gray-300 rounded px-2 py-1"
                        title="Clear filter"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  
                  {/* Toggle controls */}
                  <div className="flex gap-4">
                    {/* Radar toggle */}
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="radarToggle"
                        checked={showRadar}
                        onChange={() => setShowRadar(prev => !prev)}
                        className="mr-2"
                      />
                      <label htmlFor="radarToggle" className="text-sm text-gray-700">
                        Show Weather Radar
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="h-[400px] sm:h-[600px] w-full">
                <Map 
                  warnings={filteredWarnings} 
                  center={[43.6532, -79.3832]} 
                  zoom={8}
                  showRadar={showRadar}
                  radarType="rainviewer"
                />
              </div>
            </div>
            
            {/* Add more spacing above warning details section */}
            <div className="bg-white p-3 sm:p-4 rounded shadow-md mt-16">
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Warning Details</h2>
              
              <div className="space-y-3 sm:space-y-4">
                {filteredWarnings.map((warning: any) => (
                  <div 
                    key={warning._id} 
                    id={`warning-${warning._id}`}
                    className="border p-3 sm:p-4 rounded text-sm sm:text-base transition-all duration-300"
                    style={{ borderLeftWidth: '4px', borderLeftColor: warning.color }}
                  >
                    <div className="flex items-center mb-2 flex-wrap gap-1">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: warning.color }}
                      />
                      <h3 className="text-base sm:text-lg font-medium mr-auto">
                        {warning.title}
                      </h3>
                      {/* Severity badge */}
                      <div className={`ml-auto text-xs px-2 py-1 rounded-full ${
                        warning.severity === 'low' ? 'bg-blue-100 text-blue-800' :
                        warning.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        warning.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {warning.severity || 'medium'}
                      </div>
                    </div>
                    
                    <p className="mb-2 whitespace-pre-line">{warning.context}</p>
                    
                    <div className="text-sm text-gray-600 flex justify-between">
                      <span>Created: {new Date(warning.createdAt).toLocaleString()}</span>
                      <span>Expires: {new Date(warning.expiresAt).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        <footer className="mt-10 py-4 text-center text-gray-600 border-t">
          <p>© {new Date().getFullYear()} Warning System. All rights reserved.</p>
        </footer>
      </div>
    </main>
  );
}
