
"use client";

import type { NewsArticle } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResponsiveImage } from "@/components/ui/optimized-image";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, ArrowRight } from "lucide-react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { bn } from 'date-fns/locale'; // Import Bengali locale
import Link from "next/link";
import { useAppContext } from "@/context/AppContext";
import { Skeleton } from "@/components/ui/skeleton";

interface NewsCardProps {
  article: NewsArticle;
}

export default function NewsCard({ article }: NewsCardProps) {
  const { getUIText, isClient, language: currentLocale } = useAppContext();

  // Debug: Log the imageUrl to the browser console
  console.log('NewsCard imageUrl:', article.imageUrl);

  if (!isClient) {
    let formattedDateSsr = "N/A";
    try {
      if (article.publishedDate) {
        formattedDateSsr = formatDistanceToNow(parseISO(article.publishedDate), { addSuffix: true, locale: currentLocale === 'bn' ? bn : undefined });
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
      <Card className="flex flex-col h-full overflow-hidden shadow-lg rounded-lg bg-white border border-gray-200">
        <div className="relative w-full aspect-video"> {/* Changed h-48 to aspect-video */}
          <ResponsiveImage
            src={article.imageUrl || "/placeholder-image.svg"}
            alt={article.title}
            dataAiHint={article.dataAiHint || "news article"}
          />
        </div>
        <CardHeader>
          <CardTitle className="text-xl leading-tight mb-1 text-gray-900">{article.title}</CardTitle>
           <div className="flex items-center text-xs text-gray-500 space-x-2">
            <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">{article.category}</Badge>
            <div className="flex items-center">
                <CalendarDays className="mr-1 h-3 w-3" />
                <span>{formattedDateSsr}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-grow">
          <CardDescription className="text-sm text-gray-600 line-clamp-3">{article.excerpt || ''}</CardDescription> {/* Added line-clamp-3 for consistency */}
        </CardContent>
        <CardFooter>
          <Button asChild variant="default" size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled>
            <span className="flex items-center">
              Loading... <ArrowRight className="ml-2 h-4 w-4" />
            </span>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const displayTitle = article.title;
  const displayExcerpt = article.excerpt;
  
  let relativeDate = "N/A";
  try {
    if (article.publishedDate) {
      relativeDate = formatDistanceToNow(parseISO(article.publishedDate), { addSuffix: true, locale: currentLocale === 'bn' ? bn : undefined });
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
  
  const seeMoreText = getUIText("seeMore");

  return (
    <Link href={`/article/${article.id}`} className="block">
      <div className="flex flex-col h-full overflow-hidden bg-white border border-gray-200 hover:shadow-lg transition-shadow duration-300 cursor-pointer">
        <div className="relative w-full aspect-video">
          <ResponsiveImage
            src={article.imageUrl || "/placeholder-image.svg"}
            alt={displayTitle}
            dataAiHint={article.dataAiHint || "news article"}
          />
        </div>
        <div className="p-4 flex-grow">
          <div className="flex items-center text-xs text-gray-500 space-x-2 mb-2">
            <Badge variant="secondary" className="text-xs bg-red-100 text-red-700 border-0">{article.category}</Badge>
            <div className="flex items-center">
              <CalendarDays className="mr-1 h-3 w-3" />
              <span>{relativeDate}</span>
            </div>
          </div>
          <h3 className="text-lg font-bold leading-tight mb-2 text-black line-clamp-2 hover:text-yellow-600 transition-colors">{displayTitle}</h3>
          <p className="text-sm text-gray-600 line-clamp-3 mb-4">{displayExcerpt}</p>
          <Button
            variant="default"
            size="sm"
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold transition-transform duration-200 hover:scale-105"
            aria-label={`${seeMoreText} ${displayTitle}`}
          >
            {seeMoreText}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </Link>
  );
}

