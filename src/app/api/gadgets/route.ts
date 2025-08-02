import { NextRequest, NextResponse } from 'next/server';
import { getActiveGadgetsBySections } from '@/lib/data-optimized';
import type { LayoutSection } from '@/lib/types';

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