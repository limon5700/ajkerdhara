"use client";

import type { NewsArticle } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { CategoryBadge } from "@/components/ui/category-badge";
import { CalendarDays } from "lucide-react";
import { formatDistanceToNow, parseISO } from "date-fns";

import Link from "next/link";
import { useAppContext } from "@/context/AppContext";
import { ResponsiveImage } from "@/components/ui/optimized-image";
import Image from 'next/image'; // Import Next.js Image component

interface SidebarArticleCardProps {
  article: NewsArticle;
}

export default function SidebarArticleCard({ article }: SidebarArticleCardProps) {
  const { getUIText, isClient } = useAppContext();

  const displayTitle = article.title;

  const relativeDate = isClient && article.publishedDate ? 
    formatDistanceToNow(parseISO(article.publishedDate), { 
      addSuffix: true
    }) : 
    '';

  return (
    <Link href={`/article/${article.id}`} className="block group">
      <div className="flex items-start space-x-3 bg-white rounded-lg p-2">
        <div className="flex-shrink-0 relative w-24 h-24 overflow-hidden rounded-md">
          <Image // Changed from ResponsiveImage to Image
            src={article.imageUrl || "/placeholder-image.svg"}
            alt={displayTitle}
            fill={true} // Use fill={true} as in details page
            priority={false} // Not a LCP image
            data-ai-hint={article.dataAiHint || "sidebar news article"}
            unoptimized={true} // Base64 images are not optimized
            style={{ objectFit: "cover" }} // Ensure objectFit is cover

          />
        </div>
        <div className="flex-1 py-1 pr-1">
          <CategoryBadge category={article.category} size="sm" className="mb-1" />
          <h3 className="text-md font-semibold text-black leading-tight line-clamp-2 hover:underline cursor-pointer">
            {displayTitle}
          </h3>
          <div className="flex items-center text-xs text-gray-500 mt-1">
            <CalendarDays className="mr-1 h-3 w-3" />
            <span suppressHydrationWarning>{relativeDate}</span>
          </div>
        </div>
      </div>
    </Link>
  );
} 