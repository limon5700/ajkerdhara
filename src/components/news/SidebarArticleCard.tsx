"use client";

import type { NewsArticle } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, ArrowRight } from "lucide-react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { bn } from 'date-fns/locale';
import Link from "next/link";
import { useAppContext } from "@/context/AppContext";

interface SidebarArticleCardProps {
  article: NewsArticle;
}

export default function SidebarArticleCard({ article }: SidebarArticleCardProps) {
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
  console.log('SidebarArticleCard imageUrl:', article.imageUrl);

  return (
    <Link href={`/article/${article.id}`} className="block">
      <div className="flex items-start space-x-3 p-2 hover:bg-gray-50 transition-colors duration-200 cursor-pointer">
        <div className="relative w-16 h-16 flex-shrink-0">
          <Image
            src={article.imageUrl || "/placeholder-image.svg"}
            alt={displayTitle}
            fill={true}
            style={{objectFit:"cover"}}
            className="rounded"
            data-ai-hint={article.dataAiHint || "sidebar news article"}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-black line-clamp-2 mb-1 leading-tight hover:text-yellow-600 transition-colors">{displayTitle}</h4>
          <div className="flex items-center text-xs text-gray-500 space-x-2">
            <Badge variant="secondary" className="text-xs bg-red-100 text-red-700 border-0 px-1 py-0">{article.category}</Badge>
            <div className="flex items-center">
              <CalendarDays className="mr-1 h-3 w-3" />
              <span>{relativeDate}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
} 