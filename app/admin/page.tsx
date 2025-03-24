'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// We need to dynamically import the Map component because Leaflet 
// requires window to be defined (which doesn't exist during SSR)
const Map = dynamic(() => import('../components/Map'), {
  loading: () => <p>Loading Map...</p>,
  ssr: false,
});

export default function AdminPage() {
  const [title, setTitle] = useState('');
  const [context, setContext] = useState('');
  const [polygon, setPolygon] = useState<number[][][]>([]);
  const [color, setColor] = useState('#FF0000');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'severe'>('medium');
  const [expiresAt, setExpiresAt] = useState<Date>(new Date(Date.now() + 24 * 60 * 60 * 1000)); // Default to 24h from now
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showRadar, setShowRadar] = useState(true);
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  
  // Fetch warnings only once when the component loads
  useEffect(() => {
    fetchWarnings();
    // No automatic polling
  }, []);
  
  const fetchWarnings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/warnings');
      const data = await response.json();
      setWarnings(data);
    } catch (error) {
      setMessage({ text: 'Failed to fetch warnings', type: 'error' });
    } finally {
      setLoading(false);
    }
  };
  
  const handlePolygonCreated = (newPolygon: number[][][]) => {
    setPolygon(newPolygon);
    setMessage({ text: 'Polygon created successfully! Fill out the form and publish.', type: 'success' });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !context || polygon.length === 0) {
      setMessage({ text: 'Please fill all fields and draw a polygon on the map', type: 'error' });
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch('/api/warnings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          context,
          polygon: polygon[0],
          color,
          severity,
          expiresAt: expiresAt.toISOString(),
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create warning');
      }
      
      // Reset form
      setTitle('');
      setContext('');
      setPolygon([]);
      setColor('#FF0000');
      setSeverity('medium');
      setExpiresAt(new Date(Date.now() + 24 * 60 * 60 * 1000));
      
      setMessage({ text: 'Warning published successfully!', type: 'success' });
      
      // Refresh warnings list
      fetchWarnings();
    } catch (error) {
      setMessage({ text: 'Failed to publish warning', type: 'error' });
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this warning?')) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch(`/api/warnings/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete warning');
      }
      
      setMessage({ text: 'Warning deleted successfully!', type: 'success' });
      
      // Refresh warnings list
      fetchWarnings();
    } catch (error) {
      setMessage({ text: 'Failed to delete warning', type: 'error' });
    } finally {
      setLoading(false);
    }
  };
  
  // Function to share a warning
  const handleShare = (id: string) => {
    // Create a shareable URL with the warning ID
    const shareUrl = `${window.location.origin}/?warningId=${id}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setMessage({ text: 'Share link copied to clipboard!', type: 'success' });
      })
      .catch(err => {
        setMessage({ text: 'Failed to copy share link', type: 'error' });
        console.error('Failed to copy: ', err);
      });
  };

  // Handle date change with proper typing
  const handleDateChange = (date: Date | null) => {
    if (date) {
      setExpiresAt(date);
    }
  };
  
  // Add a manual refresh function
  const handleRefresh = () => {
    fetchWarnings();
  };
  
  // Filter warnings based on severity
  const filteredWarnings = warnings.filter((warning: any) => {
    if (severityFilter === 'all') return true;
    return warning.severity === severityFilter;
  });

  return (
    <div className="container mx-auto p-2 sm:p-4">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Warning System - Admin Panel</h1>
      
      <div className="mb-4 flex justify-end">
        <button
          onClick={handleRefresh}
          className="px-3 sm:px-4 py-1 sm:py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm sm:text-base"
        >
          Refresh Warnings
        </button>
      </div>
      
      {/* Message display */}
      {message.text && (
        <div className={`p-3 sm:p-4 mb-3 sm:mb-4 rounded text-sm sm:text-base ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message.text}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Map section */}
        <div className="bg-white p-3 sm:p-4 rounded shadow-md">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-semibold">Draw Warning Area</h2>
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
          <p className="mb-3 sm:mb-4 text-xs sm:text-sm text-gray-600">
            Draw a polygon on the map to define the warning area. Use the draw tools on the right side of the map.
          </p>
          <div className="h-[400px] sm:h-[600px] w-full">
            <Map 
              editMode={true}
              onPolygonCreated={handlePolygonCreated} 
              onPolygonEdited={(editedPolygon) => {
                setPolygon(editedPolygon);
                setMessage({ text: 'Polygon updated', type: 'success' });
              }}
              warnings={warnings} 
              center={[43.6532, -79.3832]} 
              zoom={8}
              showRadar={showRadar}
              radarType="mrms"
              onWarningClick={() => {}}
              selectedWarningId={null}
              setRadarControls={(controls) => {
                console.log("Radar controls set:", controls);
                // You can use the controls here if needed
              }}
            />
          </div>
        </div>
        
        {/* Form section */}
        <div className="bg-white p-3 sm:p-4 rounded shadow-md">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Warning Details</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-3 sm:mb-4">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Warning Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-2 sm:px-3 py-1 sm:py-2 border border-gray-300 rounded text-sm"
                placeholder="e.g., Severe Weather Alert"
                required
              />
            </div>
            
            <div className="mb-3 sm:mb-4">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Warning Context
              </label>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="w-full px-2 sm:px-3 py-1 sm:py-2 border border-gray-300 rounded text-sm"
                rows={4}
                placeholder="Provide details about the warning..."
                required
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Warning Color
                </label>
                <div className="flex items-center">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="h-8 sm:h-10 w-8 sm:w-10 border border-gray-300 rounded mr-2"
                  />
                  <span className="text-xs sm:text-sm text-gray-600">{color}</span>
                </div>
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Warning Severity
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as 'low' | 'medium' | 'high' | 'severe')}
                  className="w-full px-2 sm:px-3 py-1 sm:py-2 border border-gray-300 rounded text-sm"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="severe">Severe</option>
                </select>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Expires At
              </label>
              <DatePicker
                selected={expiresAt}
                onChange={handleDateChange}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="MMMM d, yyyy h:mm aa"
                minDate={new Date()}
                className="w-full px-2 sm:px-3 py-1 sm:py-2 border border-gray-300 rounded text-sm"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading || polygon.length === 0}
              className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {loading ? 'Publishing...' : 'Publish Warning'}
            </button>
          </form>
        </div>
      </div>
      
      {/* Active warnings section */}
      <div className="mt-16 sm:mt-20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl font-semibold">Active Warnings</h2>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Severity filter for admin */}
            <div className="flex items-center">
              <label htmlFor="adminSeverityFilter" className="text-sm text-gray-700 mr-2">
                Filter by severity:
              </label>
              <select
                id="adminSeverityFilter"
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="all">All warnings</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="severe">Severe</option>
              </select>
              {/* Add clear filter button */}
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
          </div>
        </div>
        
        {warnings.length === 0 ? (
          <div className="bg-gray-100 text-gray-600 p-3 sm:p-4 rounded text-center text-sm sm:text-base">
            No active warnings at this time.
          </div>
        ) : filteredWarnings.length === 0 ? (
          <div className="bg-yellow-100 text-yellow-800 p-3 sm:p-4 rounded text-center">
            <h3 className="font-semibold mb-2">No Warnings Match Filter</h3>
            <p className="text-sm mb-3">There are no warnings with the selected severity level.</p>
            <button
              onClick={() => setSeverityFilter('all')}
              className="bg-yellow-200 hover:bg-yellow-300 text-yellow-800 px-3 py-1 rounded text-sm"
            >
              Show All Warnings
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filteredWarnings.map((warning: any) => (
              <div 
                key={warning._id} 
                className="bg-white border rounded shadow-sm p-3 sm:p-4 relative"
                style={{ borderLeftWidth: '4px', borderLeftColor: warning.color || '#FF0000' }}
              >
                <div className="flex items-center justify-between mb-1 flex-wrap gap-1">
                  <h3 className="font-medium text-sm sm:text-base">
                    {warning.title}
                  </h3>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleDelete(warning._id)}
                      className="text-red-600 hover:text-red-800 text-xs sm:text-sm px-1 py-0.5"
                      title="Delete Warning"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => handleShare(warning._id)}
                      className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm px-1 py-0.5"
                      title="Share Warning"
                    >
                      Share
                    </button>
                  </div>
                </div>
                <div className="flex gap-2 items-center mb-1 text-xs sm:text-sm">
                  <div className={`px-2 py-0.5 rounded-full ${
                    warning.severity === 'low' ? 'bg-blue-100 text-blue-800' :
                    warning.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    warning.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {warning.severity || 'medium'}
                  </div>
                  <div className="text-gray-500">
                    Expires: {new Date(warning.expiresAt).toLocaleString()}
                  </div>
                </div>
                <p className="text-gray-700 text-xs sm:text-sm line-clamp-2">{warning.context}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Display map with warnings */}
      <div className="bg-white p-3 sm:p-4 rounded shadow-md mt-4 sm:mt-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Warning Map</h2>
        <Map 
          warnings={filteredWarnings} 
          showRadar={showRadar}
          radarType="mrms"
          onPolygonCreated={() => {}}
          onPolygonEdited={() => {}}
          setRadarControls={() => {}}
          onWarningClick={() => {}}
          selectedWarningId={null}
        />
      </div>
    </div>
  );
} 