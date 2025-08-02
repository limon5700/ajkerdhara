
"use client";

import React, { useEffect, useState, useCallback, useMemo, Fragment } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { parseISO, formatDistanceToNow } from 'date-fns';
import { bn } from 'date-fns/locale'; // Import Bengali locale
import { ArrowLeft, Loader2, Youtube, Facebook, Link as LinkIcon, CalendarDays } from 'lucide-react'; 

import type { NewsArticle, Gadget, LayoutSection, SeoSettings } from '@/lib/types';
import { getArticleById, getActiveGadgetsBySection, getSeoSettings, getRelatedArticles } from '@/lib/data-optimized';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AdDisplay from '@/components/ads/AdDisplay';
import { translateText } from '@/ai/flows/translate-text-flow';
import { useToast } from "@/hooks/use-toast";
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppContext } from '@/context/AppContext';
import RelatedPosts from '@/components/news/RelatedPosts';


// Helper function to render content with inline ads
const renderContentWithAds = (
  content: string,
  articleSpecificSnippets: string[] = [],
  defaultInlineGadgets: Gadget[] = [],
  articleId: string
): React.ReactNode[] => {
    const contentParts = content.split(/(\[AD_INLINE\])/g); 
    const result: React.ReactNode[] = [];
    let snippetIndex = 0;
    let defaultGadgetIndex = 0;

    contentParts.forEach((part, index) => {
        if (part === '[AD_INLINE]') {
            let adRendered = false;
            if (snippetIndex < articleSpecificSnippets.length) {
                const snippet = articleSpecificSnippets[snippetIndex];
                result.push(
                    <AdDisplay
                        key={`ad-specific-${articleId}-${snippetIndex}`}
                        gadget={{
                            content: snippet,
                            isActive: true,
                            section: 'article-inline', 
                            id: `inline-specific-${articleId}-${snippetIndex}` 
                        }}
                        className="my-4 inline-ad-widget"
                    />
                );
                adRendered = true;
                snippetIndex++;
            }
            
            if (!adRendered && defaultGadgetIndex < defaultInlineGadgets.length) {
                const defaultGadget = defaultInlineGadgets[defaultGadgetIndex];
                 result.push(
                    <AdDisplay
                        key={`ad-default-${articleId}-${defaultGadget.id}-${defaultGadgetIndex}`}
                        gadget={defaultGadget}
                        className="my-4 inline-ad-widget default-inline-ad"
                    />
                );
                defaultGadgetIndex = (defaultGadgetIndex + 1) % defaultInlineGadgets.length; 
                adRendered = true;
            }
            // Removed warning log for unrendered ad
        } else if (part) { 
            result.push(<span key={`content-${articleId}-${index}`} dangerouslySetInnerHTML={{ __html: part.replace(/\n/g, '<br />') }} />);
        }
    });
    return result;
};

export default function ArticlePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { language, getUIText, isClient } = useAppContext();
  const id = params.id as string;

  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [activeGadgets, setActiveGadgets] = useState<Record<LayoutSection, Gadget[]>>({
      'homepage-top': [], 'homepage-content-bottom': [], 'homepage-article-interstitial': [],
      'article-top': [], 'article-bottom': [], 'sidebar-left': [], 'sidebar-right': [],
      'footer': [], 'article-inline': [], 'header-logo-area': [], 'below-header': [],
  });
  const [globalSeoSettings, setGlobalSeoSettings] = useState<SeoSettings | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<NewsArticle[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isTranslating, setIsTranslating] = useState(false);
  const [displayTitle, setDisplayTitle] = useState<string>('');
  const [displayContent, setDisplayContent] = useState<string>('');
  const [translationsCache, setTranslationsCache] = useState<Record<string, { title: string, content: string }>>({});

  const fetchArticleAndGadgets = useCallback(async () => {
    if (!id || !isClient) return;
    console.log("Fetching article with ID:", id);
    setIsLoading(true);
    try {
      const [foundArticle, seoSettings] = await Promise.all([
        getArticleById(id),
        getSeoSettings()
      ]);
      
      console.log("Article found:", foundArticle ? "Yes" : "No");
      setGlobalSeoSettings(seoSettings);

      if (foundArticle) {
        setArticle(foundArticle);
        setDisplayTitle(foundArticle.title); 
        setDisplayContent(foundArticle.content); 
        console.log("Article loaded successfully:", foundArticle.title);

        // Fetch related articles
        try {
          const related = await getRelatedArticles(foundArticle.id, foundArticle.category, 6);
          setRelatedArticles(related);
          console.log("Related articles loaded:", related.length);
        } catch (error) {
          console.error("Error fetching related articles:", error);
          setRelatedArticles([]);
        }

        const sectionsToFetch: LayoutSection[] = [
          'article-top', 'article-bottom', 'sidebar-left', 'sidebar-right',
          'footer', 'article-inline', 'header-logo-area', 'below-header', 
        ];
        const gadgetPromises = sectionsToFetch.map(section => getActiveGadgetsBySection(section));
        const gadgetResults = await Promise.all(gadgetPromises);
        
        const newGadgets: Partial<Record<LayoutSection, Gadget[]>> = {};
        sectionsToFetch.forEach((section, index) => {
          newGadgets[section] = gadgetResults[index] || [];
        });
        setActiveGadgets(prev => ({...prev, ...newGadgets}));

      } else {
        console.warn("Article not found for ID:", id);
        toast({ title: getUIText("error") || "Error", description: getUIText("articleNotFound"), variant: "destructive" });
        router.push('/'); 
      }
    } catch (error) {
      console.error("Failed to fetch article, SEO settings or gadgets:", error);
      toast({ title: getUIText("error") || "Error", description: "Failed to load article details, settings or ads.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isClient, toast, getUIText, router]); 

  useEffect(() => {
    fetchArticleAndGadgets();
  }, [fetchArticleAndGadgets]);

  const performTranslation = useCallback(async () => {
    if (!article || !language || !isClient) return;

    if (language === 'en') { 
      setDisplayTitle(article.title);
      setDisplayContent(article.content);
      return;
    }

    if (translationsCache[language]) {
      setDisplayTitle(translationsCache[language].title);
      setDisplayContent(translationsCache[language].content);
      return;
    }

    setIsTranslating(true);
    try {
      const [titleResult, contentResult] = await Promise.all([
        translateText({ text: article.title, targetLanguage: language }),
        translateText({ text: article.content, targetLanguage: language })
      ]);
      const newTitle = titleResult.translatedText;
      const newContent = contentResult.translatedText;
      setDisplayTitle(newTitle);
      setDisplayContent(newContent);
      setTranslationsCache(prev => ({ ...prev, [language]: { title: newTitle, content: newContent } }));
    } catch (error) {
      console.error("Error translating article:", error);
      toast({
        title: getUIText("translationFailed"),
        description: getUIText("couldNotTranslateArticle") + (error instanceof Error ? ` ${error.message}` : ''),
        variant: "destructive",
      });
      setDisplayTitle(article.title); 
      setDisplayContent(article.content); 
    } finally {
      setIsTranslating(false);
    }
  }, [article, language, toast, getUIText, isClient, translationsCache]);

  useEffect(() => {
    if (article && isClient) {
      performTranslation();
    } else if (article && !isClient) {
        setDisplayTitle(article.title);
        setDisplayContent(article.content);
    }
  }, [article, language, isClient, performTranslation]);

  // In renderGadgetsForSection, ensure all gadgets are rendered (no limit)
  const renderGadgetsForSection = (section: LayoutSection, className?: string) => {
    const gadgets = activeGadgets[section] || [];
    if (gadgets.length === 0) return null;
    return (
      <div className={`section-gadgets section-${section}-container ${className || ''}`}>
        {gadgets.map((gadget) => (
          <AdDisplay key={gadget.id} gadget={gadget} className="mb-4" /> 
        ))}
      </div>
    );
  };

  const JsonLd = () => {
    if (!article || !globalSeoSettings) return null;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:9002';
    const schema = {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": article.canonicalUrl || `${siteUrl}/article/${article.id}`
      },
      "headline": article.metaTitle || article.title,
      "image": article.ogImage || article.imageUrl ? [article.ogImage || article.imageUrl] : undefined,
      "datePublished": article.publishedDate,
      "dateModified": article.publishedDate, 
      "author": {
        "@type": "Organization", 
        "name": globalSeoSettings.ogSiteName || "AjkerDhara"
      },
      "publisher": {
        "@type": "Organization",
        "name": globalSeoSettings.ogSiteName || "AjkerDhara",
        "logo": {
          "@type": "ImageObject",
          "url": `${siteUrl}/logo.png` 
        }
      },
      "description": article.metaDescription || article.excerpt,
      "articleBody": article.content.substring(0, 2500) + "..." 
    };
    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    );
  };


   if (!isClient && !id) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Skeleton className="h-16 w-full" />
        <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </main>
        <Skeleton className="h-16 w-full" /> 
      </div>
    );
  }

  if (isLoading) { 
    return (
      <div className="flex flex-col min-h-screen bg-white">
        {renderGadgetsForSection('header-logo-area', 'container mx-auto px-4 pt-4')}
        <Header onSearch={(term) => router.push(`/?search=${term}`)} />
        {renderGadgetsForSection('below-header', 'container mx-auto px-4 pt-4')}
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Sidebar Skeleton */}
            <aside className="w-full lg:w-1/4 order-last lg:order-first space-y-6">
              <div className="bg-white border border-gray-200 p-4 rounded-lg hidden lg:block">
                <Skeleton className="h-6 w-24 mb-4 rounded-md" />
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={`left-skel-${i}`} className="flex items-start space-x-3">
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
            
            {/* Main Content Skeleton */}
            <div className="w-full lg:w-2/3 order-first lg:order-none">
              <Skeleton className="h-10 w-32 mb-6 rounded-md" />
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-lg">
                <Skeleton className="h-80 w-full rounded-none" />
                <div className="p-6">
                  <Skeleton className="h-12 w-3/4 mb-4 rounded-md" />
                  <div className="flex items-center gap-4 mb-4">
                    <Skeleton className="h-6 w-20 rounded-md" />
                    <Skeleton className="h-6 w-32 rounded-md" />
                  </div>
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-full rounded-md" />
                    <Skeleton className="h-6 w-full rounded-md" />
                    <Skeleton className="h-6 w-5/6 rounded-md" />
                    <Skeleton className="h-6 w-full rounded-md" />
                    <Skeleton className="h-6 w-4/5 rounded-md" />
                    <Skeleton className="h-6 w-full rounded-md" />
                    <Skeleton className="h-6 w-3/4 rounded-md" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Sidebar Skeleton */}
            <aside className="w-full lg:w-1/4 order-last space-y-6">
              <div className="bg-white border border-gray-200 p-4 rounded-lg hidden lg:block">
                <Skeleton className="h-6 w-32 mb-4 rounded-md" />
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={`right-skel-${i}`} className="flex items-start space-x-3">
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
        </main>
        <Skeleton className="h-16 w-full mt-6 rounded-md container mx-auto px-4 mb-4" />
        <Footer />
      </div>
    );
  }

  if (!article && !isLoading) { 
    return (
       <div className="flex flex-col min-h-screen bg-white">
        <Header onSearch={(term) => router.push(`/?search=${term}`)} />
        <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-black mb-4">{getUIText("articleNotFound")}</h1>
            <p className="text-gray-600 mb-6">The article you're looking for could not be found.</p>
            <Button 
              onClick={() => router.push('/')} 
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
            >
              Back to Home
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!article) return null; 

  let relativeDate = "N/A";
  if (isClient && article?.publishedDate) {
    try {
      relativeDate = formatDistanceToNow(parseISO(article.publishedDate), { addSuffix: true, locale: language === 'bn' ? bn : undefined });
    } catch (e) {
      try {
        relativeDate = new Date(article.publishedDate).toLocaleDateString();
      } catch {}
    }
  }


  return (
    <>
      <JsonLd />
      <div className="flex flex-col min-h-screen bg-white text-black font-sans">
        {renderGadgetsForSection('header-logo-area', 'container mx-auto px-4 pt-4')}
        <Header onSearch={(term) => router.push(`/?search=${term}`)} />
        {renderGadgetsForSection('below-header', 'container mx-auto px-4 pt-4')}
                 <main className="flex-grow container mx-auto px-4 py-8">
           <div className="flex flex-col lg:flex-row gap-8">
               {/* Left Side - Article Content */}
               <div className="w-full lg:w-1/3 order-first lg:order-none">
                   {/* Back Button */}
                   <Button 
                     variant="outline" 
                     onClick={() => router.back()} 
                     className="mb-6 group bg-white border-gray-300 text-black hover:bg-gray-50 hover:border-yellow-500 transition-colors"
                   >
                     <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                     {getUIText("backToNews")}
                   </Button>
                   
                   {/* Top Ads */}
                   {renderGadgetsForSection('article-top', 'mb-6')}
                   
                   {/* Article Content Card */}
                   <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-lg">
                     {/* Article Header */}
                     <div className="p-6">
                       {/* Article Title */}
                       {isTranslating && !displayTitle ? (
                         <Skeleton className="h-12 w-3/4 mb-4 rounded-md" />
                       ) : (
                         <h1 className="text-2xl md:text-3xl font-bold leading-tight mb-4 text-black">
                           {displayTitle || article.title}
                         </h1>
                       )}
                       
                       {/* Article Meta */}
                       <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600 mb-4">
                         <Badge variant="secondary" className="text-sm px-3 py-1 bg-red-100 text-red-700 border-0 font-semibold">
                           {article.category}
                         </Badge>
                         <span className="flex items-center">
                           <span className="mr-1">{isClient ? getUIText("publishedDateLabel") || "Published" : "Published"}:</span>
                           <span suppressHydrationWarning className="font-medium">{relativeDate}</span>
                         </span>
                       </div>
                       
                       {/* Social Links */}
                       {(article.articleYoutubeUrl || article.articleFacebookUrl || article.articleMoreLinksUrl) && (
                         <div className="flex items-center gap-3 pt-2 border-t border-gray-200">
                           {article.articleYoutubeUrl && (
                             <a 
                               href={article.articleYoutubeUrl} 
                               target="_blank" 
                               rel="noopener noreferrer" 
                               aria-label="Article YouTube Link" 
                               className="text-gray-600 hover:text-red-600 transition-colors p-2 rounded-full hover:bg-red-50"
                             >
                               <Youtube className="h-5 w-5" />
                             </a>
                           )}
                           {article.articleFacebookUrl && (
                             <a 
                               href={article.articleFacebookUrl} 
                               target="_blank" 
                               rel="noopener noreferrer" 
                               aria-label="Article Facebook Link" 
                               className="text-gray-600 hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-blue-50"
                             >
                               <Facebook className="h-5 w-5" />
                             </a>
                           )}
                           {article.articleMoreLinksUrl && (
                             <a 
                               href={article.articleMoreLinksUrl} 
                               target="_blank" 
                               rel="noopener noreferrer" 
                               aria-label="More Article Links" 
                               className="text-gray-600 hover:text-yellow-600 transition-colors p-2 rounded-full hover:bg-yellow-50"
                             >
                               <LinkIcon className="h-5 w-5" />
                             </a>
                           )}
                         </div>
                       )}
                     </div>
                     
                     {/* Article Content */}
                     <div className="px-6 pb-6">
                       {isTranslating && !displayContent ? (
                         <div className="space-y-3">
                           <Skeleton className="h-6 w-full rounded-md" />
                           <Skeleton className="h-6 w-full rounded-md" />
                           <Skeleton className="h-6 w-5/6 rounded-md" />
                           <Skeleton className="h-6 w-full rounded-md" />
                           <Skeleton className="h-6 w-4/5 rounded-md" />
                         </div>
                       ) : (
                         <article className="prose prose-lg max-w-none text-black leading-relaxed">
                           <div className="text-base md:text-lg leading-7 space-y-4">
                             {renderContentWithAds(
                               displayContent || article.content,
                               article.inlineAdSnippets,
                               activeGadgets['article-inline'],
                               article.id
                             ).map((node, index) => <Fragment key={index}>{node}</Fragment>)}
                           </div>
                         </article>
                       )}
                     </div>
                   </div>
                   
                   {/* Translation Status */}
                   {isTranslating && (
                     <div className="mt-6 text-center flex items-center justify-center text-yellow-600 bg-yellow-50 p-4 rounded-lg">
                       <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                       <span className="font-medium">{getUIText("translating")}</span>
                     </div>
                   )}
                   
                   {/* Bottom Ads */}
                   {renderGadgetsForSection('article-bottom', 'mt-6')}
               </div>
               
               {/* Middle - Related Posts */}
               <div className="w-full lg:w-1/3 order-last lg:order-none">
                   {/* Related Posts Section */}
                   {isLoading ? (
                     <div className="mt-12">
                       <Skeleton className="h-8 w-48 mb-6 rounded-md" />
                       <div className="space-y-4">
                         {[...Array(4)].map((_, index) => (
                           <div key={`related-skel-${index}`} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                             <div className="flex">
                               <Skeleton className="w-24 h-24 rounded-none" />
                               <div className="p-3 flex-1">
                                 <Skeleton className="h-4 w-full mb-2 rounded-md" />
                                 <Skeleton className="h-3 w-3/4 rounded-md" />
                               </div>
                             </div>
                           </div>
                         ))}
                       </div>
                     </div>
                   ) : (
                     <div className="mt-12">
                       <h2 className="text-xl font-bold text-black mb-6 border-b border-gray-200 pb-2">Related Posts</h2>
                       <div className="space-y-4">
                         {relatedArticles.slice(0, 4).map((relatedArticle) => {
                           let relativeDate = "N/A";
                           if (isClient && relatedArticle.publishedDate) {
                             try {
                               relativeDate = formatDistanceToNow(parseISO(relatedArticle.publishedDate), { 
                                 addSuffix: true, 
                                 locale: language === 'bn' ? bn : undefined 
                               });
                             } catch (e) {
                               try {
                                 relativeDate = new Date(relatedArticle.publishedDate).toLocaleDateString();
                               } catch {}
                             }
                           }

                           return (
                             <Link key={relatedArticle.id} href={`/article/${relatedArticle.id}`} className="block">
                               <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer">
                                 <div className="flex">
                                   {relatedArticle.imageUrl && (
                                     <div className="relative w-24 h-24 flex-shrink-0">
                                       <Image
                                         src={relatedArticle.imageUrl || "/placeholder-image.svg"}
                                         alt={relatedArticle.title}
                                         fill={true}
                                         style={{objectFit:"cover"}}
                                         className="transition-transform duration-300 hover:scale-105"
                                         data-ai-hint={`related article: ${relatedArticle.title}`}
                                       />
                                     </div>
                                   )}
                                   <div className="p-3 flex-1">
                                     <div className="flex items-center text-xs text-gray-500 space-x-2 mb-1">
                                       <Badge variant="secondary" className="text-xs bg-red-100 text-red-700 border-0 font-semibold">
                                         {relatedArticle.category}
                                       </Badge>
                                       <div className="flex items-center">
                                         <CalendarDays className="mr-1 h-3 w-3" />
                                         <span suppressHydrationWarning>{relativeDate}</span>
                                       </div>
                                     </div>
                                     <h3 className="text-sm font-bold text-black line-clamp-2 leading-tight hover:text-yellow-600 transition-colors">
                                       {relatedArticle.title}
                                     </h3>
                                   </div>
                                 </div>
                               </div>
                             </Link>
                           );
                         })}
                       </div>
                     </div>
                   )}
               </div>
               
               {/* Right Side - Article Image */}
               <div className="w-full lg:w-1/3 order-last lg:order-none">
                   {/* Article Image Card */}
                   <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-lg sticky top-8">
                     {article.imageUrl && (
                       <div className="relative w-full h-96 lg:h-[500px]">
                         <Image 
                           src={article.imageUrl || "/placeholder-image.svg"} 
                           alt={isTranslating && !displayTitle ? (getUIText("loading") || "Loading...") : displayTitle || article.title} 
                           fill={true} 
                           style={{objectFit:"cover"}} 
                           priority 
                           data-ai-hint={article.dataAiHint || "news article detail"}
                         />
                       </div>
                     )}
                     
                     {/* Image Caption */}
                     <div className="p-4">
                       <p className="text-sm text-gray-600 italic">
                         {displayTitle || article.title}
                       </p>
                     </div>
                   </div>
                   
                   {/* Right Sidebar Gadgets */}
                   <div className="mt-6 space-y-6">
                     {renderGadgetsForSection('sidebar-right')}
                     {activeGadgets['sidebar-right']?.length === 0 && (
                       <div className="bg-white border border-gray-200 p-4 rounded-lg">
                         <h3 className="font-bold text-black mb-2 text-sm">Right Sidebar</h3>
                         <p className="text-xs text-gray-500">No content available.</p>
                       </div>
                     )}
                   </div>
               </div>
           </div>
         </main>
         
         {/* Similar Posts Section - Full Width */}
         {relatedArticles.length > 0 && (
           <div className="mt-12 bg-gray-50 py-12">
             <div className="container mx-auto px-4">
               <h2 className="text-2xl font-bold text-black mb-6 border-b border-gray-200 pb-2">Similar Posts</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                 {relatedArticles.slice(0, 8).map((relatedArticle) => {
                   let relativeDate = "N/A";
                   if (isClient && relatedArticle.publishedDate) {
                     try {
                       relativeDate = formatDistanceToNow(parseISO(relatedArticle.publishedDate), { 
                         addSuffix: true, 
                         locale: language === 'bn' ? bn : undefined 
                       });
                     } catch (e) {
                       try {
                         relativeDate = new Date(relatedArticle.publishedDate).toLocaleDateString();
                       } catch {}
                     }
                   }

                   return (
                     <Link key={`similar-${relatedArticle.id}`} href={`/article/${relatedArticle.id}`} className="block">
                       <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer">
                         {relatedArticle.imageUrl && (
                           <div className="relative w-full h-48">
                             <Image
                               src={relatedArticle.imageUrl || "/placeholder-image.svg"}
                               alt={relatedArticle.title}
                               fill={true}
                               style={{objectFit:"cover"}}
                               className="transition-transform duration-300 hover:scale-105"
                               data-ai-hint={`similar article: ${relatedArticle.title}`}
                             />
                           </div>
                         )}
                         <div className="p-4">
                           <div className="flex items-center text-xs text-gray-500 space-x-2 mb-2">
                             <Badge variant="secondary" className="text-xs bg-red-100 text-red-700 border-0 font-semibold">
                               {relatedArticle.category}
                             </Badge>
                             <div className="flex items-center">
                               <CalendarDays className="mr-1 h-3 w-3" />
                               <span suppressHydrationWarning>{relativeDate}</span>
                             </div>
                           </div>
                           <h3 className="text-lg font-bold text-black line-clamp-2 leading-tight hover:text-yellow-600 transition-colors mb-2">
                             {relatedArticle.title}
                           </h3>
                           <p className="text-sm text-gray-600 line-clamp-3">
                             {relatedArticle.excerpt || "Read more about this story..."}
                           </p>
                         </div>
                       </div>
                     </Link>
                   );
                 })}
               </div>
             </div>
           </div>
         )}
         
        {renderGadgetsForSection('footer', 'container mx-auto px-4 pt-4')}
        <Footer />
      </div>
    </>
  );
}
