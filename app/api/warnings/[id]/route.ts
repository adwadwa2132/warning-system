import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/app/utils/dbConnect';
import Warning from '@/app/models/Warning';

// GET /api/warnings/[id] - Get a specific warning
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
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
    return NextResponse.json(
      { error: 'Failed to delete warning' },
      { status: 500 }
    );
  }
} 