"use client";

import type { NewsArticle } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HeroImage } from "@/components/ui/optimized-image";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, ArrowRight } from "lucide-react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { bn } from 'date-fns/locale';
import Link from "next/link";
import { useAppContext } from "@/context/AppContext";

interface FeaturedArticleCardProps {
  article: NewsArticle;
}

export default function FeaturedArticleCard({ article }: FeaturedArticleCardProps) {
  const { getUIText, isClient, language: currentLocale } = useAppContext();

  // Handle SSR and client-side rendering
  const displayTitle = article.title;
  const displayExcerpt = article.excerpt;
  const seeMoreText = isClient ? getUIText("seeMore") : "See More";

  // Format relative date
  const relativeDate = isClient && article.publishedDate ? 
    formatDistanceToNow(parseISO(article.publishedDate), { 
      addSuffix: true, 
      locale: currentLocale === 'bn' ? bn : undefined 
    }) : 
    '';

  // Debug: Log the imageUrl to the browser console
  console.log('FeaturedArticleCard imageUrl:', article.imageUrl);

  return (
    <Link href={`/article/${article.id}`} className="block">
      <div className="relative overflow-hidden bg-white border border-gray-200 hover:shadow-lg transition-shadow duration-300 cursor-pointer">
        <div className="relative w-full h-96">
          <HeroImage
            src={article.imageUrl || "/placeholder-image.svg"}
            alt={displayTitle}
            dataAiHint={article.dataAiHint || "featured news article"}
          />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          
          {/* Content overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="flex items-center text-sm space-x-4 mb-3">
              <Badge variant="secondary" className="text-xs bg-red-600 text-white border-0">{article.category}</Badge>
              <div className="flex items-center">
                <CalendarDays className="mr-1 h-4 w-4" />
                <span>{relativeDate}</span>
              </div>
            </div>
            <CardTitle className="text-4xl font-bold text-white leading-tight mb-3 drop-shadow-lg">{displayTitle}</CardTitle>
            <CardDescription className="text-lg text-gray-200 leading-relaxed drop-shadow-md">{displayExcerpt}</CardDescription>
            
            <Button
              variant="default"
              size="lg"
              className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-black font-bold transition-transform duration-200 hover:scale-105"
              aria-label={`${seeMoreText} ${displayTitle}`}
            >
              {seeMoreText}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
} 