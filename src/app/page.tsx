
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

// Metadata generation is typically handled by `layout.tsx` for client components,
// or this page would need to be a Server Component if dynamic metadata from `getSeoSettings` is critical here.
// Assuming `layout.tsx` provides sufficient default SEO.

export default function HomePage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [activeGadgets, setActiveGadgets] = useState<Record<LayoutSection, Gadget[]>>({
    'homepage-top': [], 'homepage-content-bottom': [], 'homepage-article-interstitial': [],
    'article-top': [], 'article-bottom': [],  'sidebar-left': [], 'sidebar-right': [],
    'footer': [], 'article-inline': [], 'header-logo-area': [], 'below-header': [],
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [isPageLoading, setIsPageLoading] = useState(true);
  const { getUIText, isClient } = useAppContext();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      if (!isClient) return;
      setIsPageLoading(true);
      try {
        // Force refresh all cache to ensure fresh data from database
        forceRefreshCache();
        
        console.log('Fetching fresh articles from database...');
        
        // Fetch articles from API with cache busting
        const timestamp = Date.now();
        const articlesResponse = await fetch(`/api/articles?t=${timestamp}`);
        if (!articlesResponse.ok) {
          throw new Error('Failed to fetch articles');
        }
        const articlesData = await articlesResponse.json();
        const fetchedArticles = articlesData.articles || [];
        console.log('Articles fetched:', fetchedArticles?.length || 0);
        console.log('Fetched articles:', fetchedArticles);
        
        const sortedArticles = (Array.isArray(fetchedArticles) ? fetchedArticles : [])
          .sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime());
        setArticles(sortedArticles);

        // Fetch gadgets from API with cache busting
        const sectionsToFetch: LayoutSection[] = [
          'homepage-top', 'homepage-content-bottom', 'homepage-article-interstitial',
          'sidebar-left', 'sidebar-right', 'footer', 'header-logo-area', 'below-header',
        ];
        const sectionsParam = sectionsToFetch.join(',');
        const gadgetsResponse = await fetch(`/api/gadgets?sections=${sectionsParam}&t=${timestamp}`);
        if (gadgetsResponse.ok) {
          const gadgetsData = await gadgetsResponse.json();
          const gadgetsBySection = gadgetsData.gadgets || {};
          setActiveGadgets(prev => ({...prev, ...gadgetsBySection}));
        }

      } catch (error) {
        console.error("Failed to fetch articles or gadgets:", error);
        toast({ title: getUIText("error") || "Error", description: "Failed to load page content.", variant: "destructive" });
        setArticles([]);
      } finally {
        setIsPageLoading(false);
      }
    };

    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient, toast, getUIText]);

  const filteredArticles = useMemo(() => {
    const safeArticles = Array.isArray(articles) ? articles : [];
    return safeArticles
      .filter(article =>
        selectedCategory === 'All' || article.category === selectedCategory
      )
      .filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (article.excerpt && article.excerpt.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (typeof article.category === 'string' && article.category.toLowerCase().includes(searchTerm.toLowerCase()))
      );
  }, [articles, searchTerm, selectedCategory]);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const handleSelectCategory = useCallback((category: Category | 'All') => {
    setSelectedCategory(category);
  }, []);

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

  // Separate featured article and remaining articles
  const featuredArticle = filteredArticles.length > 0 ? filteredArticles[0] : null;
  const remainingArticles = filteredArticles.slice(1);
  const sidebarArticles = remainingArticles.slice(0, 5); // Show latest 5 articles in sidebar

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
                {/* Featured Article - Hero Section (Latest Post) */}
                {featuredArticle && (
                  <div className="mb-8">
                    <FeaturedArticleCard article={featuredArticle} />
                  </div>
                )}

                {/* Latest Articles Grid (Posts 2-5) */}
                {remainingArticles.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-black mb-4 border-b border-gray-300 pb-2">Latest Posts</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {remainingArticles.slice(0, 4).map((article) => (
                        <NewsCard key={article.id} article={article} />
                      ))}
                    </div>
                  </div>
                )}



                {/* MORE HEADLINES Section */}
                {remainingArticles.length > 5 && (
                  <div className="mb-8 bg-white border border-gray-200 p-4 rounded-lg">
                    <h3 className="text-lg font-bold text-black mb-4 border-b border-gray-300 pb-2">MORE HEADLINES</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {remainingArticles.slice(5, 9).map((article) => (
                        <SidebarArticleCard key={article.id} article={article} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional Articles Grid */}
                {remainingArticles.length > 9 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {remainingArticles.slice(9).map((article) => (
                      <NewsCard key={article.id} article={article} />
                    ))}
                  </div>
                )}

                {filteredArticles.length === 0 && (
                  <p className="text-center text-gray-600 mt-16 text-xl">{getUIText("noArticlesFound")}</p>
                )}
              </div>

              {/* Sidebar - Right Side */}
              <aside className="w-full lg:w-1/3 order-2 space-y-6">
                {renderGadgetsForSection('sidebar-right')}
                
                {/* MUST READ Section */}
                {sidebarArticles.length > 0 && (
                  <div className="bg-white border border-gray-200 p-4">
                    <h3 className="text-lg font-bold text-black mb-4 border-b border-gray-300 pb-2">MUST READ</h3>
                    <div className="space-y-4">
                      {sidebarArticles.slice(0, 4).map((article) => (
                        <SidebarArticleCard key={article.id} article={article} />
                      ))}
                    </div>
                  </div>
                )}



                {activeGadgets['sidebar-right']?.length === 0 && sidebarArticles.length === 0 && (
                  <Card className="p-4 bg-white border border-gray-200">
                     <CardHeader className="p-0 pb-2"><CardTitle className="text-sm text-gray-600">Sidebar</CardTitle></CardHeader>
                     <CardContent className="p-0"><p className="text-xs text-gray-500">No content available.</p></CardContent>
                  </Card>
                )}
              </aside>
            </div>
            
            <div className="mt-8">{renderGadgetsForSection('homepage-content-bottom')}</div>
            
            {/* Related Posts Section */}
            {filteredArticles.length > 0 && (
              <div className="mt-12">
                <div className="container mx-auto px-4">
                  <h2 className="text-2xl font-bold text-black mb-6 border-b border-gray-200 pb-2">Related Posts</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredArticles.slice(0, 8).map((article) => (
                      <NewsCard key={`related-${article.id}`} article={article} />
                    ))}
                  </div>
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

