import { NextRequest, NextResponse } from 'next/server';
import { getActiveGadgetsBySections } from '@/lib/data-optimized';
import { addGadget, updateGadget } from '@/lib/data';
import type { LayoutSection, CreateGadgetData } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sectionsParam = searchParams.get('sections');
    
    if (!sectionsParam) {
      return NextResponse.json(
        { error: 'Sections parameter is required' },
        { status: 400 }
      );
    }

    const sections: LayoutSection[] = sectionsParam.split(',') as LayoutSection[];
    const gadgets = await getActiveGadgetsBySections(sections);
    
    return NextResponse.json({ gadgets });
  } catch (error) {
    console.error('Error fetching gadgets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gadgets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateGadgetData = await request.json();
    
    // Validate required fields
    if (!body.section || !body.content || !body.adType) {
      return NextResponse.json(
        { error: 'Missing required fields: section, content, and adType are required' },
        { status: 400 }
      );
    }

    const newGadget = await addGadget(body);
    
    if (!newGadget) {
      return NextResponse.json(
        { error: 'Failed to create gadget' },
        { status: 500 }
      );
    }

    return NextResponse.json({ gadget: newGadget }, { status: 201 });
  } catch (error) {
    console.error('Error creating gadget:', error);
    return NextResponse.json(
      { error: 'Failed to create gadget' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body: CreateGadgetData & { id: string } = await request.json();
    
    if (!body.id) {
      return NextResponse.json(
        { error: 'Gadget ID is required for updates' },
        { status: 400 }
      );
    }

    const { id, ...updateData } = body;
    const updatedGadget = await updateGadget(id, updateData);
    
    if (!updatedGadget) {
      return NextResponse.json(
        { error: 'Gadget not found or failed to update' },
        { status: 404 }
      );
    }

    return NextResponse.json({ gadget: updatedGadget });
  } catch (error) {
    console.error('Error updating gadget:', error);
    return NextResponse.json(
      { error: 'Failed to update gadget' },
      { status: 500 }
    );
  }
} 