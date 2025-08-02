import { NextRequest, NextResponse } from 'next/server';
import { getAllNewsArticles } from '@/lib/data-optimized';

export async function GET(request: NextRequest) {
  try {
    const articles = await getAllNewsArticles();
    
    // Debug: Check if articles have imageUrl
    if (articles.length > 0) {
      console.log('API Debug: First article imageUrl:', articles[0].imageUrl);
      console.log('API Debug: Articles with imageUrl:', articles.filter(a => a.imageUrl).length);
      console.log('API Debug: Articles without imageUrl:', articles.filter(a => !a.imageUrl).length);
    }
    
    return NextResponse.json({ articles });
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
} 