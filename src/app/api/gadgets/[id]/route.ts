import { NextRequest, NextResponse } from 'next/server';
import { getGadgetById, updateGadget, deleteGadget } from '@/lib/data';
import type { CreateGadgetData } from '@/lib/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Gadget ID is required' },
        { status: 400 }
      );
    }

    const gadget = await getGadgetById(id);
    
    if (!gadget) {
      return NextResponse.json(
        { error: 'Gadget not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ gadget });
  } catch (error) {
    console.error('Error fetching gadget:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gadget' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body: CreateGadgetData = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Gadget ID is required' },
        { status: 400 }
      );
    }

    const updatedGadget = await updateGadget(id, body);
    
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Gadget ID is required' },
        { status: 400 }
      );
    }

    const success = await deleteGadget(id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Gadget not found or failed to delete' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Gadget deleted successfully' });
  } catch (error) {
    console.error('Error deleting gadget:', error);
    return NextResponse.json(
      { error: 'Failed to delete gadget' },
      { status: 500 }
    );
  }
}
