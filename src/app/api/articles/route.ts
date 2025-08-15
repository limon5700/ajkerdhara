import { NextRequest, NextResponse } from 'next/server';
import { getAllNewsArticles, getHomePageArticles, getDetailsPageArticles } from '@/lib/data-optimized';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const category = searchParams.get('category'); // Get category parameter for filtering
    const postId = searchParams.get('postId'); // Get post ID parameter for specific post targeting
    const placement = searchParams.get('placement') as 'article-related' | 'article-sidebar' | null; // Get specific placement
    
    let articles;
    let logPrefix;
    
    if (type === 'homepage') {
      console.log('API: Attempting to fetch home page articles...');
      articles = await getHomePageArticles();
      logPrefix = 'home page';
    } else if (type === 'details') {
      console.log(`API: Attempting to fetch details page articles for placement: ${placement || 'all'}, category: ${category || 'all'}, post: ${postId || 'all'}...`);
      articles = await getDetailsPageArticles(undefined, category || undefined, postId || undefined, placement || undefined);
      logPrefix = `details page (placement: ${placement || 'all'}, category: ${category || 'all'}, post: ${postId || 'all'})`;
    } else {
      console.log('API: Attempting to fetch all news articles...');
      articles = await getAllNewsArticles();
      logPrefix = 'all';
    }
    
    if (!articles) {
      console.warn(`API: get${type ? (type === 'homepage' ? 'HomePage' : type === 'details' ? 'DetailsPage' : 'AllNews') : 'AllNews'}Articles returned null or undefined. Returning empty array.`);
      return NextResponse.json({ articles: [] });
    }

    console.log(`API: Fetched ${articles.length} ${logPrefix} articles.`);
    // Log a sample of articles to check content, but be careful with large data
    const articlesSample = articles.slice(0, 2).map(article => ({ 
      id: article.id, 
      title: article.title, 
      imageUrl: article.imageUrl ? article.imageUrl.substring(0, 50) + '...' : 'N/A',
      displayPlacements: article.displayPlacements
    }));
    console.log(`API: Sample of fetched ${logPrefix} articles:`, articlesSample);

    return NextResponse.json({ articles });
  } catch (error) {
    console.error('Error fetching articles in API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
} 

export async function POST(request: NextRequest) {
  try {
    const { addNewsArticle } = await import('@/lib/data');
    const body = await request.json();

    // Ensure metaKeywords is an array of strings
    if (body.metaKeywords !== undefined && !Array.isArray(body.metaKeywords)) {
        body.metaKeywords = String(body.metaKeywords || '').split(',').map((k: string) => k.trim()).filter((k: string) => k);
    } else if (body.metaKeywords === undefined) {
        body.metaKeywords = [];
    }

    const newArticle = await addNewsArticle(body);

    if (newArticle) {
      return NextResponse.json(newArticle, { status: 201 });
    } else {
      return NextResponse.json({ error: 'Failed to create article' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error creating article in API route:', error);
    return NextResponse.json(
      { error: 'Failed to create article', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  console.log('Debug (route.ts): PUT request received!'); // New log at the very beginning
  try {
    const { updateNewsArticle } = await import('@/lib/data');
    const body = await request.json();
    const { id, ...updates } = body;

    // Debug: Log the updates object to see what's being received
    console.log('Debug (route.ts): PUT request - updates object:', updates);

    if (!id) {
      return NextResponse.json({ error: 'Article ID is required for update' }, { status: 400 });
    }

    // Ensure metaKeywords is an array of strings before passing to updateNewsArticle
    if (updates.metaKeywords !== undefined && !Array.isArray(updates.metaKeywords)) {
        updates.metaKeywords = String(updates.metaKeywords || '').split(',').map((k: string) => k.trim()).filter((k: string) => k);
    } else if (updates.metaKeywords === undefined) {
        // If metaKeywords is explicitly undefined from the client, treat as empty array
        updates.metaKeywords = [];
    }

    const updatedArticle = await updateNewsArticle(id, updates);

    if (updatedArticle) {
      return NextResponse.json(updatedArticle, { status: 200 });
    } else {
      return NextResponse.json({ error: 'Failed to update article' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error updating article in API route:', error);
    return NextResponse.json(
      { error: 'Failed to update article', details: (error as Error).message },
      { status: 500 }
    );
  }
} 