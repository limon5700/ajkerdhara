
"use client";

import type { Metadata } from 'next';
import { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import type { NewsArticle, Category, Gadget, LayoutSection } from '@/lib/types';
import { clearArticlesCache, forceRefreshCache } from '@/lib/cache';
import { categories as allNewsCategories } from '@/lib/constants';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import NewsList from '@/components/news/NewsList';
import CategoryFilter from '@/components/news/CategoryFilter';
import AdDisplay from '@/components/ads/AdDisplay';
import { Skeleton } from "@/components/ui/skeleton";
import { useAppContext } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LazyLoad } from '@/components/ui/lazy-load';
import NewsCard from '@/components/news/NewsCard';
import FeaturedArticleCard from '@/components/news/FeaturedArticleCard';
import SidebarArticleCard from '@/components/news/SidebarArticleCard';
import AlternatingPostsAndAds from '@/components/news/AlternatingPostsAndAds';

// Metadata generation is typically handled by `layout.tsx` for client components,
// or this page would need to be a Server Component if dynamic metadata from `getSeoSettings` is critical here.
// Assuming `layout.tsx` provides sufficient default SEO.

export default function HomePage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [activeGadgets, setActiveGadgets] = useState<Record<LayoutSection, Gadget[]>>({
    'homepage-top': [], 
    'homepage-content-bottom': [], 
    'homepage-article-interstitial': [],
    'homepage-latest-posts': [], 
    'homepage-more-headlines': [], 
    'article-top': [], 
    'article-bottom': [], 
    'article-related': [],
    'sidebar-left': [], 
    'sidebar-right': [], 
    'footer': [], 
    'article-inline': [], 
    'header-logo-area': [], 
    'below-header': [],
    'article-details-page': [], 
    'article-details-sidebar': []
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [isPageLoading, setIsPageLoading] = useState(true);
  const { isClient } = useAppContext();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      if (!isClient) return;
      setIsPageLoading(true);
      
      try {
        // Use Promise.all for parallel fetching to reduce loading time
        const [articlesResponse, gadgetsResponse] = await Promise.all([
          fetch('/api/articles?type=homepage'),
          fetch('/api/gadgets?sections=homepage-top,homepage-content-bottom,homepage-article-interstitial,homepage-latest-posts,homepage-more-headlines,article-related,sidebar-left,sidebar-right,footer,header-logo-area,below-header')
        ]);

        // Process articles
        if (articlesResponse.ok) {
          const articlesData = await articlesResponse.json();
          const fetchedArticles = articlesData.articles || [];
          const sortedArticles = (Array.isArray(fetchedArticles) ? fetchedArticles : [])
            .sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime());
          setArticles(sortedArticles);
        }

        // Process gadgets
        if (gadgetsResponse.ok) {
          const gadgetsData = await gadgetsResponse.json();
          const gadgetsBySection = gadgetsData.gadgets || {};
          setActiveGadgets(prev => ({...prev, ...gadgetsBySection}));
        }

      } catch (error) {
        console.error("Failed to fetch articles or gadgets:", error);
        toast({ title: "Error", description: "Failed to load page content.", variant: "destructive" });
        setArticles([]);
      } finally {
        // Set minimum loading time to 500ms for better UX
        setTimeout(() => setIsPageLoading(false), 500);
      }
    };

    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient, toast]);

  const filteredArticles = useMemo(() => {
    const safeArticles = Array.isArray(articles) ? articles.filter(article => 
      article && article.title && typeof article.title === 'string' && article.title.trim() !== ''
    ) : [];
    const termLower = searchTerm.toLowerCase();

    // First, filter by category and search term
    const baseFiltered = safeArticles
      .filter(article =>
        selectedCategory === 'All' || article.category === selectedCategory
      )
      .filter(article =>
        article.title && article.title.toLowerCase().includes(termLower) ||
        (article.excerpt && article.excerpt.toLowerCase().includes(termLower)) ||
        (typeof article.category === 'string' && article.category.toLowerCase().includes(termLower))
      );

    // Categorize articles based on displayPlacements
    const heroArticle = baseFiltered.find(article => article.displayPlacements?.includes('homepage-hero')) || null;

    const homepageLatestPosts = baseFiltered.filter(article => 
        article.id !== heroArticle?.id && article.displayPlacements?.includes('homepage-latest-posts')
    );

    const homepageMoreHeadlines = baseFiltered.filter(article => 
        article.id !== heroArticle?.id && article.displayPlacements?.includes('homepage-more-headlines')
    );

    const sidebarMustRead = baseFiltered.filter(article => 
        article.id !== heroArticle?.id && article.displayPlacements?.includes('sidebar-right')
    );

    const articleRelated = baseFiltered.filter(article => 
        article.id !== heroArticle?.id && article.displayPlacements?.includes('article-related')
    );

    // Articles that are not specifically assigned to any of the above homepage sections
    const otherArticles = baseFiltered.filter(article => 
        !article.displayPlacements || article.displayPlacements.length === 0 ||
        (!article.displayPlacements.includes('homepage-hero') &&
         !article.displayPlacements.includes('homepage-latest-posts') &&
         !article.displayPlacements.includes('homepage-more-headlines') &&
         !article.displayPlacements.includes('sidebar-right') &&
         !article.displayPlacements.includes('article-related'))
    );

    return { heroArticle, homepageLatestPosts, homepageMoreHeadlines, sidebarMustRead, articleRelated, otherArticles };
  }, [articles, searchTerm, selectedCategory]);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const handleSelectCategory = useCallback((category: Category | 'All') => {
    setSelectedCategory(category);
  }, []);

  // Function to render sidebar with alternating posts and ads
  const renderSidebarWithAlternatingContent = () => {
    const sidebarArticles = sidebarMustRead.slice(0, 6); // Get up to 6 articles
    const sidebarAds = activeGadgets['sidebar-right'] || [];
    
    if (sidebarArticles.length === 0 && sidebarAds.length === 0) {
      return (
        <Card className="p-4 bg-white border border-gray-200 p-4">
          <CardHeader className="p-0 pb-2"><CardTitle className="text-sm text-gray-600"></CardTitle></CardHeader>
          <CardContent className="p-0"><p className="text-xs text-gray-500">No News available.</p></CardContent>
        </Card>
      );
    }

    const contentItems = [];
    let articleIndex = 0;
    let adIndex = 0;

    // Create alternating pattern: post → ad → post → ad
    for (let i = 0; i < 8; i++) { // Maximum 8 items total
      if (i % 2 === 0 && articleIndex < sidebarArticles.length) {
        // Even index: show article
        contentItems.push(
          <div key={`article-${sidebarArticles[articleIndex].id}`} className="mb-4">
            <SidebarArticleCard article={sidebarArticles[articleIndex]} />
          </div>
        );
        articleIndex++;
      } else if (i % 2 === 1 && adIndex < sidebarAds.length) {
        // Odd index: show ad
        contentItems.push(
          <div key={`ad-${sidebarAds[adIndex].id}`} className="mb-4">
            <div className="bg-white border border-none rounded-lg p-3">
              
              <div dangerouslySetInnerHTML={{ __html: sidebarAds[adIndex].content }} />
            </div>
          </div>
        );
        adIndex++;
      }
      
      // If we've shown all content, break
      if (articleIndex >= sidebarArticles.length && adIndex >= sidebarAds.length) {
        break;
      }
    }

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-black mb-4 border-b border-gray-300 pb-2"></h3>
        {contentItems}
      </div>
    );
  };

  // Function to render gadgets for a specific section
  const renderGadgetsForSection = (section: LayoutSection, className?: string) => {
    const gadgets = activeGadgets[section] || [];
    if (gadgets.length === 0) return null;
    return (
      <div className={`section-gadgets section-${section}-container ${className || ''} space-y-4`}>
        {gadgets.map((gadget) => (
          <AdDisplay key={gadget.id} gadget={gadget} />
        ))}
      </div>
    );
  };

  const PageSkeleton = () => (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Loading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
        <div className="h-full bg-blue-600 transition-all duration-500 ease-out" style={{ width: '100%' }}></div>
      </div>
      <Skeleton className="h-20 w-full mb-4 rounded-none" />
      <div className="container mx-auto px-4"><Skeleton className="h-24 w-full mb-6 rounded-md" /></div>
      <div className="container mx-auto px-4 flex-grow">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-2/3 order-1">
            <div className="mb-6 flex flex-wrap gap-3 justify-center">
              {[...Array(5)].map((_, i) => <Skeleton key={`cat-skel-${i}`} className="h-10 w-24 rounded-md" />)}
            </div>
            <Skeleton className="h-96 w-full mb-8 rounded-lg" />
            <Skeleton className="h-32 w-full mb-8 rounded-lg bg-red-50" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={`news-skel-${i}`} className="flex flex-col space-y-3 p-4 border border-gray-200 bg-white">
                  <Skeleton className="h-40 w-full rounded-xl" />
                  <div className="space-y-2 pt-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <aside className="w-full lg:w-1/3 order-2 space-y-6">
            <div className="bg-white border border-gray-200 p-4">
              <Skeleton className="h-6 w-24 mb-4" />
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={`sidebar-skel-${i}`} className="flex items-start space-x-3">
                    <Skeleton className="w-16 h-16 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white border border-gray-200 p-4">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={`headlines-skel-${i}`} className="flex items-start space-x-3">
                    <Skeleton className="w-16 h-16 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
        <div className="mt-8 space-y-4">
            <Skeleton className="h-24 w-full rounded-md" />
            <Skeleton className="h-24 w-full rounded-md" />
        </div>
      </div>
      <div className="container mx-auto px-4 mt-8"><Skeleton className="h-24 w-full mb-6 rounded-md" /></div>
      <Skeleton className="h-16 w-full mt-4 rounded-none" /> 
    </div>
  );

  // Destructure filtered articles
  const { heroArticle, homepageLatestPosts, homepageMoreHeadlines, sidebarMustRead, articleRelated, otherArticles } = filteredArticles;

  return (
    <div className="flex flex-col min-h-screen bg-white text-black font-sans">
      {renderGadgetsForSection('header-logo-area', 'container mx-auto px-4 pt-4')}
      <Header 
        onSearch={handleSearch} 
        categories={allNewsCategories}
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
      />
      {renderGadgetsForSection('below-header', 'container mx-auto px-4 pt-4')}

      <main className="flex-grow container mx-auto px-4 py-6">
        {isPageLoading ? (<PageSkeleton />) : (
          <>
            {renderGadgetsForSection('homepage-top', 'mb-6')}
            
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Main Content Area - Left Side */}
              <div className="w-full lg:w-2/3 order-1">
                {/* Featured Article - Hero Section */}
                {heroArticle && (
                  <div className="mb-8">
                    <FeaturedArticleCard article={heroArticle} />
                  </div>
                )}

                {/* Latest Articles Grid with Alternating Ads */}
                {homepageLatestPosts.length > 0 && (
                  <div className="mb-8">
                    <AlternatingPostsAndAds
                      articles={homepageLatestPosts}
                      ads={activeGadgets['homepage-latest-posts'] || []}
                      title="Latest Posts"
                      layout="grid"
                      maxItems={8}
                      section="homepage-latest-posts"
                    />
                  </div>
                )}

                {/* MORE HEADLINES Section with Alternating Ads */}
                {homepageMoreHeadlines.length > 0 && (
                  <div className="mb-8 bg-white border border-gray-200 p-4 rounded-lg">
                    <AlternatingPostsAndAds
                      articles={homepageMoreHeadlines}
                      ads={activeGadgets['homepage-more-headlines'] || []}
                      title="MORE HEADLINES"
                      layout="grid-2"
                      maxItems={6}
                      className=""
                      section="homepage-more-headlines"
                    />
                  </div>
                )}

                {/* Additional Articles Grid (for articles not assigned to specific sections) */}
                {otherArticles.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <h3 className="text-xl font-bold text-black mb-4 border-b border-gray-300 pb-2"></h3>
                    {otherArticles.map((article) => (
                      <NewsCard key={article.id} article={article} />
                    ))}
                  </div>
                )}

                {!heroArticle && homepageLatestPosts.length === 0 && homepageMoreHeadlines.length === 0 && otherArticles.length === 0 && (
                  <p className="text-center text-gray-600 mt-16 text-xl">No News found</p>
                )}
              </div>

              {/* Sidebar - Right Side */}
              <aside className="w-full lg:w-1/3 order-2 space-y-6">
                {renderGadgetsForSection('sidebar-right')}
                
                {/* MUST READ Section with Alternating Ads */}
                {sidebarMustRead.length > 0 && (
                  <div className="bg-white border border-gray-200 p-4">
                    <AlternatingPostsAndAds
                      articles={sidebarMustRead}
                      ads={activeGadgets['sidebar-right'] || []}
                      title="MUST READ"
                      layout="list"
                      maxItems={6}
                      className=""
                      section="sidebar-right"
                    />
                  </div>
                )}

                {renderSidebarWithAlternatingContent()}
              </aside>
            </div>
            
            <div className="mt-8">{renderGadgetsForSection('homepage-content-bottom')}</div>
            
            {/* Related Posts Section with Alternating Ads */}
            {articleRelated.length > 0 && (
              <div className="mt-12">
                <div className="container mx-auto px-4">
                  <AlternatingPostsAndAds
                    articles={articleRelated}
                    ads={activeGadgets['article-related'] || []}
                    title="Related Posts"
                    layout="grid"
                    maxItems={8}
                    section="article-related"
                  />
                </div>
              </div>
            )}
          </>
        )}
      </main>
      {renderGadgetsForSection('footer', 'container mx-auto px-4 pt-8 pb-4')}
      <Footer />
    </div>
  );
}

