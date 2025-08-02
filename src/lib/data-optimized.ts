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
  // In development, always bypass cache to ensure fresh data
  if (process.env.NODE_ENV === 'development') {
    console.log('Development mode: bypassing cache for fresh data');
  }
  try {
    const connection = await connectToDatabase();
    
    if (!connection.db || Object.keys(connection.db).length === 0) {
      console.log("Using sample data for development mode");
      return initialSampleNewsArticles;
    }
    
    const { db } = connection;
    const articlesCollection = db.collection('articles');

    const query: any = {};
    if (authorId && authorId !== 'SUPERADMIN_ENV') {
        query.authorId = authorId;
    }

    const count = await articlesCollection.countDocuments();
    console.log(`Database has ${count} articles`);
    
    if (count === 0 && initialSampleNewsArticles.length > 0) {
        console.log("Seeding initial news articles...");
        const articlesToSeed = initialSampleNewsArticles.map(article => {
            const { id, ...restOfArticle } = article;
            return {
                ...restOfArticle,
                publishedDate: new Date(article.publishedDate),
                imageUrl: article.imageUrl || '', // Ensure imageUrl is explicitly preserved
                inlineAdSnippets: article.inlineAdSnippets || [],
                metaTitle: article.metaTitle || '',
                metaDescription: article.metaDescription || '',
                metaKeywords: article.metaKeywords || [],
                ogTitle: article.ogTitle || '',
                ogDescription: article.ogDescription || '',
                ogImage: article.ogImage || '',
                canonicalUrl: article.canonicalUrl || '',
                articleYoutubeUrl: article.articleYoutubeUrl || '',
                articleFacebookUrl: article.articleFacebookUrl || '',
                articleMoreLinksUrl: article.articleMoreLinksUrl || '',
                _id: new ObjectId(),
            };
        });
        await articlesCollection.insertMany(articlesToSeed);
        console.log(`${articlesToSeed.length} articles seeded.`);
    }

    const articlesCursor = articlesCollection.find(query).sort({ publishedDate: -1 });
    const articlesArray = await articlesCursor.toArray();
    
    // Debug: Check what fields are actually returned
    if (articlesArray.length > 0) {
      console.log('Debug: First article from database has fields:', Object.keys(articlesArray[0]));
      console.log('Debug: First article imageUrl:', articlesArray[0].imageUrl);
      console.log('Debug: First article featuredImage:', articlesArray[0].featuredImage);
    }
    
    const result = articlesArray.map(mapMongoDocumentToNewsArticle);
    
    // Debug: Check what fields are in the mapped result
    if (result.length > 0) {
      console.log('Debug: First mapped article has imageUrl:', result[0].imageUrl);
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
    
    if (process.env.NODE_ENV === 'development') {
      console.warn("Returning sample data due to database connection failure");
      return initialSampleNewsArticles;
    }
    
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
    const articleDoc = await db.collection('articles').findOne({ _id: objectId });
    
    // Debug: Check what fields are returned for single article
    if (articleDoc) {
      console.log('Debug: Single article from database has fields:', Object.keys(articleDoc));
      console.log('Debug: Single article imageUrl:', articleDoc.imageUrl);
      console.log('Debug: Single article featuredImage:', articleDoc.featuredImage);
    }
    
    const result = articleDoc ? mapMongoDocumentToNewsArticle(articleDoc) : null;
    
    // Debug: Check what fields are in the mapped single article
    if (result) {
      console.log('Debug: Single mapped article has imageUrl:', result.imageUrl);
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
      console.log("Using sample data for related articles in development mode");
      return initialSampleNewsArticles
        .filter(article => article.id !== currentArticleId)
        .slice(0, limit);
    }
    
    const { db } = connection;
    const articlesCollection = db.collection('articles');

    // First try to get articles from the same category
    let relatedArticles = await articlesCollection
      .find({ 
        _id: { $ne: new ObjectId(currentArticleId) },
        category: category 
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
      console.log("No gadgets available in development mode");
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

    const gadgetsCursor = db.collection('advertisements').find(query).sort({ order: 1, createdAt: -1 });
    const gadgetsArray = await gadgetsCursor.toArray();
    const result = gadgetsArray.map(mapMongoDocumentToGadget);
    
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
      console.log("Using default SEO settings for development mode");
      const defaultSettings = {
        id: 'global_seo_settings_doc',
        siteTitle: "AjkerDhara",
        metaDescription: "Your concise news source, powered by AI.",
        metaKeywords: ["news", "bangla news", "ai news", "latest news"],
        faviconUrl: "/favicon.ico",
        ogSiteName: "AjkerDhara",
        ogLocale: "bn_BD",
        ogType: "website",
        twitterCard: "summary_large_image",
        updatedAt: new Date().toISOString(),
        footerYoutubeUrl: "https://youtube.com",
        footerFacebookUrl: "https://facebook.com",
        footerMoreLinksUrl: "#",
      };
      cache.set(cacheKey, defaultSettings, 30 * 60 * 1000);
      return defaultSettings;
    }
    
    const { db } = connection;
    const settingsDoc = await db.collection('seo_settings').findOne({ _id: 'global_seo_settings_doc' as any });
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
    
          const defaultSettings = {
        id: 'global_seo_settings_doc',
        siteTitle: "AjkerDhara",
      metaDescription: "Your concise news source, powered by AI.",
      metaKeywords: ["news", "bangla news", "ai news", "latest news"],
      faviconUrl: "/favicon.ico",
              ogSiteName: "AjkerDhara",
      ogLocale: "bn_BD",
      ogType: "website",
      twitterCard: "summary_large_image",
      updatedAt: new Date().toISOString(),
      footerYoutubeUrl: "https://youtube.com",
      footerFacebookUrl: "https://facebook.com",
      footerMoreLinksUrl: "#",
    };
    cache.set(cacheKey, defaultSettings, 30 * 60 * 1000);
    return defaultSettings;
  } catch (error) {
    console.error("Error fetching SEO settings:", error);
    const fallbackSettings = { 
      id: 'global_seo_settings_doc',
      siteTitle: "AjkerDhara - Default",
      metaDescription: "Default description.",
      metaKeywords: [],
      faviconUrl: "/favicon.ico",
      updatedAt: new Date().toISOString(),
      footerYoutubeUrl: "https://youtube.com",
      footerFacebookUrl: "https://facebook.com",
      footerMoreLinksUrl: "#",
    };
    cache.set(cacheKey, fallbackSettings, 30 * 60 * 1000);
    return fallbackSettings;
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

// Note: This file contains optimized versions of the main data functions
// For other functions, import directly from './data' 