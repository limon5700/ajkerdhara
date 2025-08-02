"use client";

import type { NewsArticle } from "@/lib/types";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { CalendarDays } from "lucide-react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { bn } from 'date-fns/locale';
import Link from "next/link";
import { useAppContext } from "@/context/AppContext";

interface RelatedPostsProps {
  articles: NewsArticle[];
  currentArticleId: string;
}

export default function RelatedPosts({ articles, currentArticleId }: RelatedPostsProps) {
  const { isClient, language: currentLocale } = useAppContext();

  if (!articles || articles.length === 0) {
    return null;
  }

  // Filter out the current article and limit to 6
  const relatedArticles = articles
    .filter(article => article.id !== currentArticleId)
    .slice(0, 6);

  if (relatedArticles.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-black mb-6 border-b border-gray-200 pb-2">Related Posts</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {relatedArticles.map((article) => {
          // Format relative date
          let relativeDate = "N/A";
          if (isClient && article.publishedDate) {
            try {
              relativeDate = formatDistanceToNow(parseISO(article.publishedDate), { 
                addSuffix: true, 
                locale: currentLocale === 'bn' ? bn : undefined 
              });
            } catch (e) {
              try {
                relativeDate = new Date(article.publishedDate).toLocaleDateString();
              } catch {}
            }
          }

          return (
            <Link key={article.id} href={`/article/${article.id}`} className="block">
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer">
                {article.imageUrl && (
                  <div className="relative w-full h-48">
                    <Image
                      src={article.imageUrl || "/placeholder-image.svg"}
                      alt={article.title}
                      fill={true}
                      style={{objectFit:"cover"}}
                      className="transition-transform duration-300 hover:scale-105"
                      data-ai-hint={`related article: ${article.title}`}
                    />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-center text-xs text-gray-500 space-x-2 mb-2">
                    <Badge variant="secondary" className="text-xs bg-red-100 text-red-700 border-0 font-semibold">
                      {article.category}
                    </Badge>
                    <div className="flex items-center">
                      <CalendarDays className="mr-1 h-3 w-3" />
                      <span suppressHydrationWarning>{relativeDate}</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-black line-clamp-2 mb-2 leading-tight hover:text-yellow-600 transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {article.excerpt || "Read more about this story..."}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
} 