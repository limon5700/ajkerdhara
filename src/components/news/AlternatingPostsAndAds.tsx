"use client";

import React, { useEffect, useState } from 'react';
import type { NewsArticle, Gadget } from "@/lib/types";
import NewsCard from "./NewsCard";
import SidebarArticleCard from "./SidebarArticleCard";
import AdDisplay from "@/components/ads/AdDisplay";

interface AlternatingPostsAndAdsProps {
  articles: NewsArticle[];
  ads: Gadget[];
  title: string;
  layout?: 'grid' | 'list' | 'grid-2';
  maxItems?: number;
  className?: string;
  section?: string; // Add section prop to identify which section this is
}

interface AlternatingPatternConfig {
  section: string;
  enabled: boolean;
  pattern: 'post-ad' | 'ad-post' | 'post-post-ad' | 'custom' | 'custom-advanced';
  maxItems: number;
  adFrequency: number;
  customPattern?: string;
  startWith?: 'post' | 'ad';
  postsBeforeAd?: number;
}

export default function AlternatingPostsAndAds({ 
  articles, 
  ads, 
  title, 
  layout = 'grid',
  maxItems = 8,
  className = "",
  section = ""
}: AlternatingPostsAndAdsProps) {
  const [config, setConfig] = useState<AlternatingPatternConfig | null>(null);
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);

  useEffect(() => {
    // Load configuration from localStorage
    try {
      const savedConfigs = localStorage.getItem('alternatingPatternConfigs');
      if (savedConfigs && section) {
        const configs = JSON.parse(savedConfigs);
        const sectionConfig = configs.find((c: AlternatingPatternConfig) => c.section === section);
        if (sectionConfig) {
          setConfig(sectionConfig);
        }
      }
    } catch (error) {
      console.error('Failed to load alternating pattern config:', error);
    } finally {
      setIsConfigLoaded(true);
    }
  }, [section]);

  if (!articles || articles.length === 0) {
    return null;
  }

  // If no config is loaded or section is disabled, use default behavior
  if (!isConfigLoaded || !config || !config.enabled) {
    return renderDefaultLayout();
  }

  // Use configuration-based layout
  return renderConfiguredLayout();

  function renderDefaultLayout() {
    const contentItems: React.ReactNode[] = [];
    let articleIndex = 0;
    let adIndex = 0;

    // Default alternating pattern: post → ad → post → ad
    for (let i = 0; i < maxItems; i++) {
      if (i % 2 === 0 && articleIndex < articles.length) {
        // Even index: show article
        if (layout === 'grid' || layout === 'grid-2') {
          contentItems.push(
            <div key={`article-${articles[articleIndex].id}`}>
              <NewsCard article={articles[articleIndex]} />
            </div>
          );
        } else {
          contentItems.push(
            <div key={`article-${articles[articleIndex].id}`} className="mb-4">
              <SidebarArticleCard article={articles[articleIndex]} />
            </div>
          );
        }
        articleIndex++;
      } else if (i % 2 === 1 && adIndex < ads.length) {
        // Odd index: show ad
        contentItems.push(
          <div key={`ad-${ads[adIndex].id}`} className="mb-4">
            <div className="bg-gray-100 border border-gray-200 rounded-lg p-3">
             
              <AdDisplay gadget={ads[adIndex]} />
            </div>
          </div>
        );
        adIndex++;
      }
      
      // If we've shown all content, break
      if (articleIndex >= articles.length && adIndex >= ads.length) {
        break;
      }
    }

    if (contentItems.length === 0) {
      return null;
    }

    return (
      <div className={className}>
        <h2 className={`font-bold text-black mb-6 border-b border-gray-200 pb-2 ${
          layout === 'grid-2' ? 'text-lg' : layout === 'list' ? 'text-lg' : 'text-2xl'
        }`}>{title}</h2>
        {layout === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {contentItems}
          </div>
        ) : layout === 'grid-2' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {contentItems}
          </div>
        ) : (
          <div className="space-y-4">
            {contentItems}
          </div>
        )}
      </div>
    );
  }

  function renderConfiguredLayout() {
    if (!config) return null;
    
    const contentItems: React.ReactNode[] = [];
    let articleIndex = 0;
    let adIndex = 0;
    let itemCount = 0;

    const maxItemsToShow = Math.min(config.maxItems, maxItems);

    if (config.pattern === 'custom' && config.customPattern) {
      // Custom pattern
      const patternParts = config.customPattern.split(',').map(p => p.trim());
      let patternIndex = 0;

      while (itemCount < maxItemsToShow && (articleIndex < articles.length || adIndex < ads.length)) {
        const patternPart = patternParts[patternIndex % patternParts.length];
        
        if (patternPart === 'P' && articleIndex < articles.length) {
          // Show post
          if (layout === 'grid' || layout === 'grid-2') {
            contentItems.push(
              <div key={`article-${articles[articleIndex].id}`}>
                <NewsCard article={articles[articleIndex]} />
              </div>
            );
          } else {
            contentItems.push(
              <div key={`article-${articles[articleIndex].id}`} className="mb-4">
                <SidebarArticleCard article={articles[articleIndex]} />
              </div>
            );
          }
          articleIndex++;
          itemCount++;
        } else if (patternPart === 'A' && adIndex < ads.length) {
          // Show ad
          contentItems.push(
            <div key={`ad-${ads[adIndex].id}`} className="mb-4">
              <div className="bg-gray-100 border border-gray-200 rounded-lg p-3">
                
                <AdDisplay gadget={ads[adIndex]} />
              </div>
            </div>
          );
          adIndex++;
          itemCount++;
        } else if (patternPart === 'P' && articleIndex >= articles.length) {
          // Skip this pattern part if no more articles
          patternIndex++;
          continue;
        } else if (patternPart === 'A' && adIndex >= ads.length) {
          // Skip this pattern part if no more ads
          patternIndex++;
          continue;
        }
        
        patternIndex++;
      }
    } else if (config.pattern === 'custom-advanced') {
      // Advanced custom pattern with start point and frequency control
      const startWith = config.startWith || 'post';
      const postsBeforeAd = config.postsBeforeAd || 1;
      
      for (let i = 0; i < maxItemsToShow && (articleIndex < articles.length || adIndex < ads.length); i++) {
        let shouldShowAd = false;
        
        if (startWith === 'post') {
          // Start with posts
          shouldShowAd = i % (postsBeforeAd + 1) === postsBeforeAd;
        } else {
          // Start with ad
          shouldShowAd = i === 0 || i % (postsBeforeAd + 1) === postsBeforeAd;
        }
        
        if (shouldShowAd && adIndex < ads.length) {
          // Show ad
          contentItems.push(
            <div key={`ad-${ads[adIndex].id}`} className="mb-4">
              <div className="bg-gray-100 border border-gray-200 rounded-lg p-3">
                
                <AdDisplay gadget={ads[adIndex]} />
              </div>
            </div>
          );
          adIndex++;
        } else if (articleIndex < articles.length) {
          // Show post
          if (layout === 'grid' || layout === 'grid-2') {
            contentItems.push(
              <div key={`article-${articles[articleIndex].id}`}>
                <NewsCard article={articles[articleIndex]} />
              </div>
            );
          } else {
            contentItems.push(
              <div key={`article-${articles[articleIndex].id}`} className="mb-4">
                <SidebarArticleCard article={articles[articleIndex]} />
              </div>
            );
          }
          articleIndex++;
        }
        
        // If we've shown all content, break
        if (articleIndex >= articles.length && adIndex >= ads.length) {
          break;
        }
      }
    } else if (config.pattern === 'post-post-ad') {
      // Post → Post → Ad pattern
      let postCount = 0;
      
      while (itemCount < maxItemsToShow && (articleIndex < articles.length || adIndex < ads.length)) {
        if (postCount < config.adFrequency && articleIndex < articles.length) {
          // Show post
          if (layout === 'grid' || layout === 'grid-2') {
            contentItems.push(
              <div key={`article-${articles[articleIndex].id}`}>
                <NewsCard article={articles[articleIndex]} />
              </div>
            );
          } else {
            contentItems.push(
              <div key={`article-${articles[articleIndex].id}`} className="mb-4">
                <SidebarArticleCard article={articles[articleIndex]} />
              </div>
            );
          }
          articleIndex++;
          postCount++;
          itemCount++;
        } else if (adIndex < ads.length) {
          // Show ad
          contentItems.push(
            <div key={`ad-${ads[adIndex].id}`} className="mb-4">
              <div className="bg-gray-100 border border-gray-200 rounded-lg p-3">
                
                <AdDisplay gadget={ads[adIndex]} />
              </div>
            </div>
          );
          adIndex++;
          postCount = 0;
          itemCount++;
        } else {
          break;
        }
      }
    } else {
      // post-ad or ad-post pattern
      const startWithAd = config.pattern === 'ad-post';
      
      for (let i = 0; i < maxItemsToShow; i++) {
        const shouldShowAd = startWithAd ? (i % 2 === 0) : (i % 2 === 1);
        
        if (shouldShowAd && adIndex < ads.length) {
          // Show ad
          contentItems.push(
            <div key={`ad-${ads[adIndex].id}`} className="mb-4">
              <div className="bg-gray-100 border border-gray-200 rounded-lg p-3">
               
                <AdDisplay gadget={ads[adIndex]} />
              </div>
            </div>
          );
          adIndex++;
        } else if (articleIndex < articles.length) {
          // Show article
          if (layout === 'grid' || layout === 'grid-2') {
            contentItems.push(
              <div key={`article-${articles[articleIndex].id}`}>
                <NewsCard article={articles[articleIndex]} />
              </div>
            );
          } else {
            contentItems.push(
              <div key={`article-${articles[articleIndex].id}`} className="mb-4">
                <SidebarArticleCard article={articles[articleIndex]} />
              </div>
            );
          }
          articleIndex++;
        }
        
        // If we've shown all content, break
        if (articleIndex >= articles.length && adIndex >= ads.length) {
          break;
        }
      }
    }

    if (contentItems.length === 0) {
      return null;
    }

    return (
      <div className={className}>
        <h2 className={`font-bold text-black mb-6 border-b border-gray-200 pb-2 ${
          layout === 'grid-2' ? 'text-lg' : layout === 'list' ? 'text-lg' : 'text-2xl'
        }`}>{title}</h2>
        {layout === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {contentItems}
          </div>
        ) : layout === 'grid-2' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {contentItems}
          </div>
        ) : (
          <div className="space-y-4">
            {contentItems}
          </div>
        )}
      </div>
    );
  }
}
