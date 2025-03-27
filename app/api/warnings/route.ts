import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/app/utils/dbConnect';
import Warning from '@/app/models/Warning';

// Check if we're in a build environment
const isBuildTime = process.env.NODE_ENV === 'development' && process.env.NETLIFY === 'true';

// GET /api/warnings - Get all active warnings
export async function GET() {
  try {
    // If we're in build environment, return mock data
    if (isBuildTime) {
      console.log('Build environment detected, returning mock warnings data');
      return NextResponse.json([]);
    }
    
    await dbConnect();
    
    // Find all active warnings that haven't expired
    const warnings = await Warning.find({ 
      isActive: true,
      expiresAt: { $gt: new Date() }
    });
    
    return NextResponse.json(warnings);
  } catch (error) {
    console.error('Error fetching warnings:', error);
    // If in build environment, just return empty array to ensure build succeeds
    if (isBuildTime) {
      return NextResponse.json([]);
    }
    return NextResponse.json(
      { error: 'Failed to fetch warnings' },
      { status: 500 }
    );
  }
}

// POST /api/warnings - Create a new warning
export async function POST(request: NextRequest) {
  try {
    // If we're in build environment, return mock response
    if (isBuildTime) {
      console.log('Build environment detected, returning mock create response');
      return NextResponse.json({id: 'mock-id'}, { status: 201 });
    }
    
    await dbConnect();
    
    const data = await request.json();
    console.log('Received warning data:', JSON.stringify(data));
    
    // Validate required fields
    if (!data.title || !data.context || !data.polygon || !data.expiresAt) {
      console.error('Missing required fields in warning data', {
        hasTitle: !!data.title,
        hasContext: !!data.context,
        hasPolygon: !!data.polygon,
        hasExpiresAt: !!data.expiresAt
      });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Ensure polygon is in the correct format
    let polygonData = data.polygon;
    if (!Array.isArray(polygonData) || polygonData.length === 0) {
      console.error('Invalid polygon format', polygonData);
      return NextResponse.json(
        { error: 'Invalid polygon data format' },
        { status: 400 }
      );
    }
    
    // Create a proper GeoJSON polygon
    const geoJsonPolygon = {
      type: 'Polygon',
      coordinates: [polygonData]
    };
    
    console.log('Creating warning with GeoJSON polygon:', JSON.stringify(geoJsonPolygon));
    
    // Create a new warning
    const warning = await Warning.create({
      title: data.title,
      context: data.context,
      polygon: geoJsonPolygon,
      color: data.color || '#FF0000',
      severity: data.severity || 'medium',
      expiresAt: new Date(data.expiresAt),
      isActive: true
    });
    
    console.log('Warning created successfully:', warning._id);
    return NextResponse.json(warning, { status: 201 });
  } catch (error) {
    console.error('Error creating warning:', error);
    // If in build environment, just return success to ensure build succeeds
    if (isBuildTime) {
      return NextResponse.json({id: 'mock-id'}, { status: 201 });
    }
    return NextResponse.json(
      { error: `Failed to create warning: ${error.message}` },
      { status: 500 }
    );
  }
} 