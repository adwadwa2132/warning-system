import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/app/utils/dbConnect';
import Warning from '@/app/models/Warning';

// GET /api/warnings - Get all active warnings
export async function GET() {
  try {
    await dbConnect();
    
    // Find all active warnings that haven't expired
    const warnings = await Warning.find({ 
      isActive: true,
      expiresAt: { $gt: new Date() }
    });
    
    return NextResponse.json(warnings);
  } catch (error) {
    console.error('Error fetching warnings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch warnings' },
      { status: 500 }
    );
  }
}

// POST /api/warnings - Create a new warning
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const data = await request.json();
    
    // Validate required fields
    if (!data.title || !data.context || !data.polygon || !data.expiresAt) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Create a new warning
    const warning = await Warning.create({
      title: data.title,
      context: data.context,
      polygon: {
        type: 'Polygon',
        coordinates: data.polygon
      },
      color: data.color || '#FF0000',
      severity: data.severity || 'medium',
      expiresAt: new Date(data.expiresAt),
      isActive: true
    });
    
    return NextResponse.json(warning, { status: 201 });
  } catch (error) {
    console.error('Error creating warning:', error);
    return NextResponse.json(
      { error: 'Failed to create warning' },
      { status: 500 }
    );
  }
} 