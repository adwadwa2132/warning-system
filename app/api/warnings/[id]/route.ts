import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/app/utils/dbConnect';
import Warning from '@/app/models/Warning';

// Check if we're in a build environment
const isBuildTime = process.env.NODE_ENV === 'development' && process.env.NETLIFY === 'true';

// GET /api/warnings/[id] - Get a specific warning
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // If we're in build environment, return mock data
    if (isBuildTime) {
      console.log('Build environment detected, returning mock warning data');
      return NextResponse.json({
        id: 'mock-id',
        title: 'Mock Warning',
        context: 'Mock Context',
        polygon: { type: 'Polygon', coordinates: [] },
        createdAt: new Date().toISOString(),
        expiresAt: new Date().toISOString(),
        isActive: true
      });
    }
    
    await dbConnect();
    
    const { id } = await context.params;
    
    const warning = await Warning.findById(id);
    
    if (!warning) {
      return NextResponse.json(
        { error: 'Warning not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(warning);
  } catch (error) {
    console.error('Error fetching warning:', error);
    // If in build environment, return mock data
    if (isBuildTime) {
      return NextResponse.json({
        id: 'mock-id',
        title: 'Mock Warning',
        context: 'Mock Context',
        polygon: { type: 'Polygon', coordinates: [] }
      });
    }
    return NextResponse.json(
      { error: 'Failed to fetch warning' },
      { status: 500 }
    );
  }
}

// PUT /api/warnings/[id] - Update a specific warning
export async function PUT(
  request: NextRequest, 
  context: { params: Promise<{ id: string }> }
) {
  try {
    // If we're in build environment, return mock data
    if (isBuildTime) {
      console.log('Build environment detected, returning mock update response');
      return NextResponse.json({
        id: 'mock-id',
        title: 'Updated Mock Warning'
      });
    }
    
    await dbConnect();
    
    const data = await request.json();
    const { id } = await context.params;
    
    const warning = await Warning.findById(id);
    
    if (!warning) {
      return NextResponse.json(
        { error: 'Warning not found' },
        { status: 404 }
      );
    }
    
    // Update warning fields
    if (data.title) warning.title = data.title;
    if (data.context) warning.context = data.context;
    if (data.polygon) {
      warning.polygon = {
        type: 'Polygon',
        coordinates: data.polygon
      };
    }
    if (data.color) warning.color = data.color;
    if (data.expiresAt) warning.expiresAt = new Date(data.expiresAt);
    if (data.isActive !== undefined) warning.isActive = data.isActive;
    
    await warning.save();
    
    return NextResponse.json(warning);
  } catch (error) {
    console.error('Error updating warning:', error);
    // If in build environment, return mock data
    if (isBuildTime) {
      return NextResponse.json({
        id: 'mock-id',
        title: 'Updated Mock Warning'
      });
    }
    return NextResponse.json(
      { error: 'Failed to update warning' },
      { status: 500 }
    );
  }
}

// DELETE /api/warnings/[id] - Delete a specific warning
export async function DELETE(
  request: NextRequest, 
  context: { params: Promise<{ id: string }> }
) {
  try {
    // If we're in build environment, return mock data
    if (isBuildTime) {
      console.log('Build environment detected, returning mock delete response');
      return NextResponse.json(
        { message: 'Warning deleted successfully' },
        { status: 200 }
      );
    }
    
    await dbConnect();
    
    const { id } = await context.params;
    
    const warning = await Warning.findByIdAndDelete(id);
    
    if (!warning) {
      return NextResponse.json(
        { error: 'Warning not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: 'Warning deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting warning:', error);
    // If in build environment, return mock success
    if (isBuildTime) {
      return NextResponse.json(
        { message: 'Warning deleted successfully' },
        { status: 200 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to delete warning' },
      { status: 500 }
    );
  }
} 