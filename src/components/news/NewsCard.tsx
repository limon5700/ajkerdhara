
"use client";

import type { NewsArticle } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

import { ResponsiveImage } from "@/components/ui/optimized-image";
import { Badge } from "@/components/ui/badge";
import { CategoryBadge } from "@/components/ui/category-badge";
import { CalendarDays } from "lucide-react";
import { formatDistanceToNow, parseISO } from "date-fns";

import Link from "next/link";
import { useAppContext } from "@/context/AppContext";
import { Skeleton } from "@/components/ui/skeleton";
import Image from 'next/image'; // Import Next.js Image component

interface NewsCardProps {
  article: NewsArticle;
}

export default function NewsCard({ article }: NewsCardProps) {
  const { getUIText, isClient } = useAppContext();

  if (!isClient) {
    let formattedDateSsr = "N/A";
    try {
      if (article.publishedDate) {
        formattedDateSsr = formatDistanceToNow(parseISO(article.publishedDate), { addSuffix: true });
      }
    } catch (e) {
      // If parsing fails, fallback to simple display or N/A
      try {
         if (article.publishedDate) {
            formattedDateSsr = new Date(article.publishedDate).toLocaleDateString();
         }
      } catch (parseError) {
        console.warn("Error parsing date for SSR in NewsCard:", parseError)
      }
    }

    return (
      <Card className="flex flex-col h-full overflow-hidden shadow-lg rounded-lg bg-white">
        <div className="relative w-full aspect-video"> {/* Changed h-48 to aspect-video */}
          <Image // Changed from ResponsiveImage to Image
            src={article.imageUrl || "/placeholder-image.svg"}
            alt={article.title}
            fill={true} // Use fill={true} as in details page
            priority={false} // Not a LCP image
            data-ai-hint={article.dataAiHint || "news article"}
            unoptimized={true} // Base64 images are not optimized
            style={{ objectFit: "cover" }} // Ensure objectFit is cover
          />
        </div>
        <CardHeader>
          <CardTitle className="text-xl leading-tight mb-1 text-gray-900">{article.title}</CardTitle>
           <div className="flex items-center text-xs text-gray-500 space-x-2">
            <CategoryBadge category={article.category} size="sm" />
            <div className="flex items-center">
                <CalendarDays className="mr-1 h-3 w-3" />
                <span>{formattedDateSsr}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-grow">
          <CardDescription className="text-sm text-gray-600 line-clamp-3">{article.excerpt || ''}</CardDescription> {/* Added line-clamp-3 for consistency */}
        </CardContent>

      </Card>
    );
  }

  const displayTitle = article.title;
  const displayExcerpt = article.excerpt;
  
  let relativeDate = "N/A";
  try {
    if (article.publishedDate) {
              relativeDate = formatDistanceToNow(parseISO(article.publishedDate), { addSuffix: true });
    }
  } catch (e) {
    console.warn("Error formatting relative date in NewsCard:", e);
     try {
         if (article.publishedDate) {
            relativeDate = new Date(article.publishedDate).toLocaleDateString();
         }
      } catch (parseError) {
         console.warn("Error parsing date for fallback in NewsCard:", parseError)
      }
  }
  


  return (
    <Link href={`/article/${article.id}`} className="block">
      <div className="flex flex-col h-full overflow-hidden bg-white">
        <div className="relative w-full aspect-video">
          <Image // Changed from ResponsiveImage to Image
            src={article.imageUrl || "/placeholder-image.svg"}
            alt={displayTitle}
            fill={true} // Use fill={true} as in details page
            priority={false} // Not a LCP image
            data-ai-hint={article.dataAiHint || "news article"}
            unoptimized={true} // Base64 images are not optimized
            style={{ objectFit: "cover" }} // Ensure objectFit is cover
          />
        </div>
        <div className="p-4 flex-grow">
          <div className="flex items-center text-xs text-gray-500 space-x-2 mb-2">
            <CategoryBadge category={article.category} size="sm" />
            <div className="flex items-center">
              <CalendarDays className="mr-1 h-3 w-3" />
              <span>{relativeDate}</span>
            </div>
          </div>
          <h3 className="text-lg font-bold leading-tight mb-2 text-black line-clamp-2 hover:underline cursor-pointer">{displayTitle}</h3>
          <p className="text-sm text-gray-600 line-clamp-3 mb-4">{displayExcerpt}</p>

        </div>
      </div>
    </Link>
  );
}

