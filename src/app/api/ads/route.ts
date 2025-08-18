import { NextRequest, NextResponse } from 'next/server';
import type { Gadget } from '@/lib/types';
import { connectToDatabase } from '@/lib/mongodb';
import { mapMongoDocumentToGadget } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const placement = searchParams.get('placement');
    const page = searchParams.get('page');
    const device = searchParams.get('device') || 'all';
    const category = searchParams.get('category');
    
    // Connect to database
    const connection = await connectToDatabase();
    if (!connection.db || Object.keys(connection.db).length === 0) {
      return NextResponse.json({ ads: [] });
    }
    
    const { db } = connection;
    
    // Build query
    let query: any = { isActive: true };
    
    // Filter by placement
    if (placement) {
      query.$or = [
        { section: placement },
        { placement: placement },
        { unifiedPlacement: placement }
      ];
    }
    
    // Filter by target pages
    if (page) {
      query.$and = [
        { $or: [
          { targetPages: { $exists: false } },
          { targetPages: { $size: 0 } },
          { targetPages: { $in: [page] } }
        ]}
      ];
    }
    
    // Filter by device targeting
    if (device !== 'all') {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { deviceTargeting: 'all' },
          { deviceTargeting: device }
        ]
      });
    }
    
    // Filter by category
    if (category) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { targetCategory: { $exists: false } },
          { targetCategory: category }
        ]
      });
    }
    
    const adsCursor = db.collection('advertisements').find(query, {
      projection: {
        _id: 1,
        section: 1,
        placement: 1,
        unifiedPlacement: 1,
        title: 1,
        content: 1,
        isActive: 1,
        order: 1,
        placementSize: 1,
        targetArticleId: 1,
        targetCategory: 1,
        adType: 1,
        autoInjectFrequency: 1,
        injectPosition: 1,
        targetPages: 1,
        deviceTargeting: 1,
        timeTargeting: 1,
        clickTracking: 1,
        impressionTracking: 1,
        priority: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    }).sort({ priority: -1, order: 1, createdAt: -1 });
    
    const adsArray = await adsCursor.toArray();
    const ads = adsArray.map(mapMongoDocumentToGadget);
    
    // Sort by priority and order
    ads.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority || 'medium'];
      const bPriority = priorityOrder[b.priority || 'medium'];
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      
      return (a.order || 0) - (b.order || 0);
    });
    
    return NextResponse.json({ ads });
  } catch (error) {
    console.error('Error fetching ads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ads' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Connect to database
    const connection = await connectToDatabase();
    if (!connection.db || Object.keys(connection.db).length === 0) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }
    
    const { db } = connection;
    
    const newAd = {
      section: body.section,
      title: body.title,
      content: body.content,
      isActive: body.isActive ?? true,
      order: body.order || 0,
      unifiedPlacement: body.unifiedPlacement,
      placementSize: body.placementSize,
      targetArticleId: body.targetArticleId,
      targetCategory: body.targetCategory,
      adType: body.adType || 'html',
      autoInjectFrequency: body.autoInjectFrequency,
      injectPosition: body.injectPosition || 'between',
      targetPages: body.targetPages || [],
      deviceTargeting: body.deviceTargeting || 'all',
      timeTargeting: body.timeTargeting,
      clickTracking: body.clickTracking || false,
      impressionTracking: body.impressionTracking || false,
      priority: body.priority || 'medium',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const result = await db.collection('advertisements').insertOne(newAd);
    
    if (result.insertedId) {
      const createdAd = await db.collection('advertisements').findOne({ _id: result.insertedId });
      return NextResponse.json(mapMongoDocumentToGadget(createdAd), { status: 201 });
    } else {
      return NextResponse.json(
        { error: 'Failed to create ad' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error creating ad:', error);
    return NextResponse.json(
      { error: 'Failed to create ad' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Ad ID is required' },
        { status: 400 }
      );
    }
    
    // Connect to database
    const connection = await connectToDatabase();
    if (!connection.db || Object.keys(connection.db).length === 0) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }
    
    const { db } = connection;
    
    // Convert string ID to ObjectId if needed
    let objectId: any = id;
    try {
      const { ObjectId } = require('mongodb');
      objectId = new ObjectId(id);
    } catch (e) {
      // If conversion fails, use the string ID as is
    }
    
    const result = await db.collection('advertisements').updateOne(
      { _id: objectId as any },
      { 
        $set: {
          ...updates,
          updatedAt: new Date()
        }
      }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Ad not found' },
        { status: 404 }
      );
    }
    
    // Return the updated ad
    const updatedAd = await db.collection('advertisements').findOne({ _id: objectId });
    return NextResponse.json(mapMongoDocumentToGadget(updatedAd));
  } catch (error) {
    console.error('Error updating ad:', error);
    return NextResponse.json(
      { error: 'Failed to update ad' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Ad ID is required' },
        { status: 400 }
      );
    }
    
    // Connect to database
    const connection = await connectToDatabase();
    if (!connection.db || Object.keys(connection.db).length === 0) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }
    
    const { db } = connection;
    
    // Convert string ID to ObjectId if needed
    let objectId: any = id;
    try {
      const { ObjectId } = require('mongodb');
      objectId = new ObjectId(id);
    } catch (e) {
      // If conversion fails, use the string ID as is
    }
    
    const result = await db.collection('advertisements').deleteOne({ _id: objectId as any });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Ad not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Ad deleted successfully' });
  } catch (error) {
    console.error('Error deleting ad:', error);
    return NextResponse.json(
      { error: 'Failed to delete ad' },
      { status: 500 }
    );
  }
}
