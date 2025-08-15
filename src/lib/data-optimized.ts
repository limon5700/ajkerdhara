'use server';

import type { NewsArticle, Gadget, CreateGadgetData, LayoutSection, Category, CreateNewsArticleData, SeoSettings, CreateSeoSettingsData, DashboardAnalytics, User, Role, Permission, CreateUserData, CreateRoleData, UpdateUserData, CreateActivityLogData, ActivityLogEntry, UserActivity } from './types';
import { connectToDatabase, ObjectId } from './mongodb';
import { initialSampleNewsArticles, availablePermissions } from './constants';
import { cache, CACHE_KEYS } from './cache';
import bcrypt from 'bcryptjs';

// Helper to map MongoDB document to NewsArticle type
function mapMongoDocumentToNewsArticle(doc: any): NewsArticle {
  if (!doc) return null as any;
  
  // Ensure imageUrl is properly extracted with fallbacks
  const imageUrl = doc.imageUrl || doc.featuredImage || doc.image || "";
  
  return {
    id: doc._id.toHexString(),
    title: doc.title,
    content: doc.content,
    excerpt: doc.excerpt,
    category: doc.category,
    publishedDate: doc.publishedDate instanceof Date ? doc.publishedDate.toISOString() : doc.publishedDate,
    imageUrl: imageUrl,
    dataAiHint: doc.dataAiHint,
    inlineAdSnippets: doc.inlineAdSnippets || [],
    authorId: doc.authorId,
    displayPlacements: doc.displayPlacements || [], // Include displayPlacements
    detailsPageCategories: doc.detailsPageCategories || [], // Include category filters
    detailsPageSpecificPosts: doc.detailsPageSpecificPosts || [], // Include specific post filters
    metaTitle: doc.metaTitle,
    metaDescription: doc.metaDescription,
    metaKeywords: doc.metaKeywords || [],
    ogTitle: doc.ogTitle,
    ogDescription: doc.ogDescription,
    ogImage: doc.ogImage,
    canonicalUrl: doc.canonicalUrl,
    articleYoutubeUrl: doc.articleYoutubeUrl,
    articleFacebookUrl: doc.articleFacebookUrl,
    articleMoreLinksUrl: doc.articleMoreLinksUrl,
  };
}

// Helper to map MongoDB document to Gadget type
function mapMongoDocumentToGadget(doc: any): Gadget {
  if (!doc) return null as any;
  return {
    id: doc._id.toHexString(),
    section: doc.section || doc.placement,
    title: doc.title,
    content: doc.content || doc.codeSnippet,
    isActive: doc.isActive,
    order: doc.order,
    createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : doc.createdAt,
  };
}

// Helper to map MongoDB document to SeoSettings type
function mapMongoDocumentToSeoSettings(doc: any): SeoSettings {
    if (!doc) return null as any;
    return {
        id: doc._id.toHexString(),
        siteTitle: doc.siteTitle,
        metaDescription: doc.metaDescription,
        metaKeywords: doc.metaKeywords || [],
        faviconUrl: doc.faviconUrl,
        ogSiteName: doc.ogSiteName,
        ogLocale: doc.ogLocale,
        ogType: doc.ogType,
        twitterCard: doc.twitterCard,
        twitterSite: doc.twitterSite,
        twitterCreator: doc.twitterCreator,
        updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : doc.updatedAt,
        footerYoutubeUrl: doc.footerYoutubeUrl,
        footerFacebookUrl: doc.footerFacebookUrl,
        footerMoreLinksUrl: doc.footerMoreLinksUrl,
    };
}

// Optimized function to get all news articles with simple caching
export async function getAllNewsArticles(authorId?: string): Promise<NewsArticle[]> {
  if (process.env.NODE_ENV === 'development') {
    console.log('Development mode: bypassing cache for fresh data');
  }
  try {
    const connection = await connectToDatabase();
    
    if (!connection.db || Object.keys(connection.db).length === 0) {
      throw new Error("Database connection not available.");
    }
    
    const { db } = connection;
    const articlesCollection = db.collection('articles');

    const query: any = {};
    if (authorId && authorId !== 'SUPERADMIN_ENV') {
        query.authorId = authorId;
    }

    const count = await articlesCollection.countDocuments();
    console.log(`Database has ${count} articles`);
    
    // Removed seeding logic to ensure no mock data is ever inserted
    // if (count === 0 && initialSampleNewsArticles.length > 0) {
    //     console.log("Seeding initial news articles...");
    //     const articlesToSeed = initialSampleNewsArticles.map(article => {
    //         const { id, ...restOfArticle } = article;
    //         return {
    //             ...restOfArticle,
    //             publishedDate: new Date(article.publishedDate),
    //             imageUrl: article.imageUrl || '', // Ensure imageUrl is explicitly preserved
    //             inlineAdSnippets: article.inlineAdSnippets || [],
    //             metaTitle: article.metaTitle || '',
    //             metaDescription: article.metaDescription || '',
    //             metaKeywords: article.metaKeywords || [],
    //             ogTitle: article.ogTitle || '',
    //             ogDescription: article.ogDescription || '',
    //             ogImage: article.ogImage || '',
    //             canonicalUrl: article.canonicalUrl || '',
    //             articleYoutubeUrl: article.articleYoutubeUrl || '',
    //             articleFacebookUrl: article.articleFacebookUrl || '',
    //             articleMoreLinksUrl: article.articleMoreLinksUrl || '',
    //             _id: new ObjectId(),
    //         };
    //     });
    //     await articlesCollection.insertMany(articlesToSeed);
    //     console.log(`${articlesToSeed.length} articles seeded.`);
    // }

    const articlesCursor = articlesCollection.find(query, {
      projection: {
        _id: 1,
        title: 1,
        excerpt: 1,
        category: 1,
        publishedDate: 1,
        imageUrl: 1,
        dataAiHint: 1,
        displayPlacements: 1, // Include displayPlacements in projection
      },
    }).sort({ publishedDate: -1 });
    const articlesArray = await articlesCursor.toArray();
    
    // Debug: Check what fields are actually returned from the database
    if (articlesArray.length > 0) {
      console.log('Debug: First article from database has fields:', Object.keys(articlesArray[0]));
      console.log('Debug: First article imageUrl from DB:', articlesArray[0].imageUrl);
      console.log('Debug: First article featuredImage from DB:', articlesArray[0].featuredImage); // Check for alternative names
      console.log('Debug: First article image from DB:', articlesArray[0].image); // Check for alternative names
      console.log('Debug: First article displayPlacements from DB:', articlesArray[0].displayPlacements); // Check new field
      // Log the full displayPlacements array from DB
      // console.log('Debug: Full displayPlacements from DB (First article):', JSON.stringify(articlesArray[0].displayPlacements));
    }
    
    const result = articlesArray.map(mapMongoDocumentToNewsArticle);
    
    // Debug: Check what imageUrl is in the mapped result
    if (result.length > 0) {
      console.log('Debug: First mapped article has imageUrl:', result[0].imageUrl);
      console.log('Debug: First mapped article has displayPlacements:', result[0].displayPlacements);
      // Log the full displayPlacements array from mapped result
      // console.log('Debug: Full displayPlacements from mapped result (First article):', JSON.stringify(result[0].displayPlacements));
    }
    
    console.log(`Fetched ${result.length} articles from database`);
    
    // Only cache if we have real database articles
    if (result.length > 0) {
      const cacheKey = `${CACHE_KEYS.ARTICLES}:${authorId || 'all'}`;
      cache.set(cacheKey, result, 30 * 1000); // 30 seconds cache for faster updates
    }
    
    return result;
  } catch (error) {
    console.error("Error fetching all news articles:", error);
    
    // Return empty array on error, do not return sample data
    return [];
  }
}

// Optimized function to get article by ID with simple caching
export async function getArticleById(id: string): Promise<NewsArticle | null> {
  if (!ObjectId.isValid(id)) {
    console.warn("Attempted to fetch article with invalid ID format:", id);
    return null;
  }

  const cacheKey = CACHE_KEYS.ARTICLE(id);
  const cached = cache.get<NewsArticle>(cacheKey);
  
  if (cached !== null) {
    return cached;
  }

  try {
    const { db } = await connectToDatabase();
    const objectId = new ObjectId(id);
    const articleDoc = await db.collection('articles').findOne({ _id: objectId }, {
      projection: {
        _id: 1,
        title: 1,
        content: 1,
        excerpt: 1,
        category: 1,
        publishedDate: 1,
        imageUrl: 1,
        dataAiHint: 1,
        inlineAdSnippets: 1,
        authorId: 1,
        metaTitle: 1,
        metaDescription: 1,
        metaKeywords: 1,
        ogTitle: 1,
        ogDescription: 1,
        ogImage: 1,
        canonicalUrl: 1,
        articleYoutubeUrl: 1,
        articleFacebookUrl: 1,
        articleMoreLinksUrl: 1,
        displayPlacements: 1, // Include displayPlacements in projection
      },
    });
    
    // Debug: Check what fields are returned for single article
    if (articleDoc) {
      console.log('Debug: Single article from database has fields:', Object.keys(articleDoc));
      console.log('Debug: Single article imageUrl:', articleDoc.imageUrl);
      console.log('Debug: Single article featuredImage:', articleDoc.featuredImage);
      console.log('Debug: Single article displayPlacements:', articleDoc.displayPlacements);
    }
    
    const result = articleDoc ? mapMongoDocumentToNewsArticle(articleDoc) : null;
    
    // Debug: Check what fields are in the mapped single article
    if (result) {
      console.log('Debug: Single mapped article has imageUrl:', result.imageUrl);
      console.log('Debug: Single mapped article has displayPlacements:', result.displayPlacements);
    }
    
    cache.set(cacheKey, result, 5 * 60 * 1000); // 5 minutes cache
    return result;
  } catch (error) {
    console.error("Error fetching article by ID:", error);
    return null;
  }
}

// Function to get related articles based on category and excluding current article
export async function getRelatedArticles(currentArticleId: string, category: string, limit: number = 6): Promise<NewsArticle[]> {
  const cacheKey = CACHE_KEYS.RELATED_ARTICLES(currentArticleId);
  const cached = cache.get<NewsArticle[]>(cacheKey);
  
  if (cached !== null) {
    return cached;
  }

  try {
    const connection = await connectToDatabase();
    
    if (!connection.db || Object.keys(connection.db).length === 0) {
      // Removed sample data fallback
      return [];
    }
    
    const { db } = connection;
    const articlesCollection = db.collection('articles');

    // First try to get articles from the same category
    let relatedArticles = await articlesCollection
      .find({ 
        _id: { $ne: new ObjectId(currentArticleId) },
        category: category 
      }, {
        projection: {
          _id: 1,
          title: 1,
          imageUrl: 1,
          category: 1,
          publishedDate: 1,
          displayPlacements: 1, // Include displayPlacements in projection
        },
      })
      .sort({ publishedDate: -1 })
      .limit(limit)
      .toArray();

    // If not enough articles from same category, get recent articles from any category
    if (relatedArticles.length < limit) {
      const additionalArticles = await articlesCollection
        .find({ 
          _id: { $ne: new ObjectId(currentArticleId) },
          category: { $ne: category }
        }, {
          projection: {
            _id: 1,
            title: 1,
            imageUrl: 1,
            category: 1,
            publishedDate: 1,
            displayPlacements: 1, // Include displayPlacements in projection
          },
        })
        .sort({ publishedDate: -1 })
        .limit(limit - relatedArticles.length)
        .toArray();
      
      relatedArticles = [...relatedArticles, ...additionalArticles];
    }

    const result = relatedArticles.map(mapMongoDocumentToNewsArticle);
    cache.set(cacheKey, result, 10 * 60 * 1000); // 10 minutes cache
    return result;

  } catch (error) {
    console.error("Error fetching related articles:", error);
    return [];
  }
}

// Optimized function to get gadgets by section with simple caching
export async function getActiveGadgetsBySection(section: LayoutSection): Promise<Gadget[]> {
  const cacheKey = CACHE_KEYS.GADGETS(section);
  const cached = cache.get<Gadget[]>(cacheKey);
  
  if (cached !== null) {
    return cached;
  }

  try {
    const connection = await connectToDatabase();
    
    if (!connection.db || Object.keys(connection.db).length === 0) {
      // Removed sample data fallback
      return [];
    }
    
    const { db } = connection;
    let query: any = {
        $or: [
            { section: section },
            { placement: section }
        ],
        isActive: true
    };

    const gadgetsCursor = db.collection('advertisements').find(query, {
      projection: {
        _id: 1,
        section: 1,
        title: 1,
        content: 1,
        isActive: 1,
        order: 1,
      },
    }).sort({ order: 1, createdAt: -1 });
    const gadgetsArray = await gadgetsCursor.toArray();
    const result = gadgetsArray.map(mapMongoDocumentToGadget);
    
    console.log(`Debug: getActiveGadgetsBySection('${section}') returned ${result.length} gadgets. Sample:`, result.slice(0,2));
    
    cache.set(cacheKey, result, 10 * 60 * 1000); // 10 minutes cache
    return result;

  } catch (error) {
    console.error(`Error fetching gadgets for section ${section}:`, error);
    return [];
  }
}

// Optimized function to get SEO settings with simple caching
export async function getSeoSettings(): Promise<SeoSettings | null> {
  const cacheKey = CACHE_KEYS.SEO_SETTINGS;
  const cached = cache.get<SeoSettings>(cacheKey);
  
  if (cached !== null) {
    return cached;
  }

  try {
    const connection = await connectToDatabase();
    
    if (!connection.db || Object.keys(connection.db).length === 0) {
      // Removed sample data fallback
      return null;
    }
    
    const { db } = connection;
    const settingsDoc = await db.collection('seo_settings').findOne({ _id: 'global_seo_settings_doc' as any }, {
      projection: {
        _id: 1,
        siteTitle: 1,
        metaDescription: 1,
        metaKeywords: 1,
        faviconUrl: 1,
        ogSiteName: 1,
        ogLocale: 1,
        ogType: 1,
        twitterCard: 1,
        twitterSite: 1,
        twitterCreator: 1,
        updatedAt: 1,
        footerYoutubeUrl: 1,
        footerFacebookUrl: 1,
        footerMoreLinksUrl: 1,
      },
    });
    if (settingsDoc) {
      const result = {
        id: settingsDoc._id.toString(),
        siteTitle: settingsDoc.siteTitle,
        metaDescription: settingsDoc.metaDescription,
        metaKeywords: settingsDoc.metaKeywords || [],
        faviconUrl: settingsDoc.faviconUrl,
        ogSiteName: settingsDoc.ogSiteName,
        ogLocale: settingsDoc.ogLocale,
        ogType: settingsDoc.ogType,
        twitterCard: settingsDoc.twitterCard,
        twitterSite: settingsDoc.twitterSite,
        twitterCreator: settingsDoc.twitterCreator,
        updatedAt: settingsDoc.updatedAt instanceof Date ? settingsDoc.updatedAt.toISOString() : settingsDoc.updatedAt,
        footerYoutubeUrl: settingsDoc.footerYoutubeUrl,
        footerFacebookUrl: settingsDoc.footerFacebookUrl,
        footerMoreLinksUrl: settingsDoc.footerMoreLinksUrl,
      };
      cache.set(cacheKey, result, 30 * 60 * 1000);
      return result;
    }
    
    // Return null if no settings found and no mock data fallback
    return null;
  } catch (error) {
    console.error("Error fetching SEO settings:", error);
    // Return null on error, do not return fallback settings
    return null;
  }
}

// Batch function to get multiple gadgets at once
export async function getActiveGadgetsBySections(sections: LayoutSection[]): Promise<Record<LayoutSection, Gadget[]>> {
  const results = await Promise.all(
    sections.map(section => getActiveGadgetsBySection(section))
  );
  
  const gadgetsBySection: Record<LayoutSection, Gadget[]> = {} as Record<LayoutSection, Gadget[]>;
  sections.forEach((section, index) => {
    gadgetsBySection[section] = results[index] || [];
  });
  
  return gadgetsBySection;
}

// Function to get articles specifically for home page
export async function getHomePageArticles(authorId?: string): Promise<NewsArticle[]> {
  try {
    const connection = await connectToDatabase();
    
    if (!connection.db || Object.keys(connection.db).length === 0) {
      throw new Error("Database connection not available.");
    }
    
    const { db } = connection;
    const articlesCollection = db.collection('articles');

    const query: any = {
      displayPlacements: { 
        $in: ['homepage-hero', 'homepage-latest-posts', 'homepage-more-headlines', 'sidebar-must-read'] 
      }
    };
    
    if (authorId && authorId !== 'SUPERADMIN_ENV') {
        query.authorId = authorId;
    }

    const articlesCursor = articlesCollection.find(query, {
      projection: {
        _id: 1,
        title: 1,
        excerpt: 1,
        category: 1,
        publishedDate: 1,
        imageUrl: 1,
        dataAiHint: 1,
        displayPlacements: 1,
      },
    }).sort({ publishedDate: -1 });
    
    const articlesArray = await articlesCursor.toArray();
    const result = articlesArray.map(mapMongoDocumentToNewsArticle);
    
    console.log(`Fetched ${result.length} home page articles from database`);
    return result;
  } catch (error) {
    console.error("Error fetching home page articles:", error);
    return [];
  }
}

// Function to get articles specifically for article details pages  
export async function getDetailsPageArticles(authorId?: string, currentArticleCategory?: string, currentArticleId?: string, placement?: 'article-related' | 'article-sidebar'): Promise<NewsArticle[]> {
  try {
    const connection = await connectToDatabase();
    
    if (!connection.db || Object.keys(connection.db).length === 0) {
      throw new Error("Database connection not available.");
    }
    
    const { db } = connection;
    const articlesCollection = db.collection('articles');

    // If specific placement is requested, filter by that placement only
    const displayPlacementFilter = placement 
      ? { displayPlacements: { $in: [placement] } }
      : { displayPlacements: { $in: ['article-related', 'article-sidebar'] } };

    const query: any = {
      ...displayPlacementFilter
    };
    
    if (authorId && authorId !== 'SUPERADMIN_ENV') {
        query.authorId = authorId;
    }

    // Build filtering conditions for targeting
    const targetingConditions = [];

    // If we have a current article category, add category-based filtering
    if (currentArticleCategory) {
      targetingConditions.push(
        { detailsPageCategories: { $in: [currentArticleCategory] } } // Articles targeted for this category
      );
    }

    // If we have a current article ID, add post-specific targeting
    if (currentArticleId) {
      targetingConditions.push(
        { detailsPageSpecificPosts: { $in: [currentArticleId] } } // Articles targeted for this specific post
      );
    }

    // Always include articles with no targeting restrictions (universal articles)
    targetingConditions.push(
      { detailsPageCategories: { $exists: false } }, // Articles with no category filter (show everywhere)
      { detailsPageCategories: { $size: 0 } }, // Articles with empty category filter (show everywhere)
      { detailsPageSpecificPosts: { $exists: false } }, // Articles with no post-specific filter
      { detailsPageSpecificPosts: { $size: 0 } } // Articles with empty post-specific filter
    );

    // Apply targeting conditions if we have any filters
    if (currentArticleCategory || currentArticleId) {
      query.$or = targetingConditions;
    }

    const articlesCursor = articlesCollection.find(query, {
      projection: {
        _id: 1,
        title: 1,
        excerpt: 1,
        category: 1,
        publishedDate: 1,
        imageUrl: 1,
        dataAiHint: 1,
        displayPlacements: 1,
        detailsPageCategories: 1,
        detailsPageSpecificPosts: 1,
      },
    }).sort({ publishedDate: -1 });
    
    const articlesArray = await articlesCursor.toArray();
    const result = articlesArray.map(mapMongoDocumentToNewsArticle);
    
    console.log(`Fetched ${result.length} details page articles from database (placement: ${placement || 'all'}, category: ${currentArticleCategory || 'all'}, post: ${currentArticleId || 'all'})`);
    return result;
  } catch (error) {
    console.error("Error fetching details page articles:", error);
    return [];
  }
}

// Note: This file contains optimized versions of the main data functions
// For other functions, import directly from './data' 