"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ArticleForm, { type ArticleFormData } from "@/components/admin/ArticleForm";
import type { NewsArticle } from "@/lib/types";
import { getArticleById, addActivityLogEntry } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import ErrorBoundary from "@/components/ErrorBoundary";
import { getSession } from "@/app/admin/auth/actions";
import Link from "next/link";

export default function EditArticlePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const articleId = params.id as string;

  useEffect(() => {
    const fetchArticle = async () => {
      if (!articleId) {
        setError("Article ID is required");
        setIsLoading(false);
        return;
      }

      try {
        const fetchedArticle = await getArticleById(articleId);
        if (fetchedArticle) {
          setArticle(fetchedArticle);
        } else {
          setError("Article not found");
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch article";
        setError(errorMessage);
        toast({ 
          title: "Error", 
          description: errorMessage, 
          variant: "destructive" 
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();
  }, [articleId, toast]);

  const handleSubmit = async (data: ArticleFormData) => {
    if (!article) return;

    setIsSubmitting(true);
    try {
      const session = await getSession();
      const authorIdToSave = session?.userId || 'SUPERADMIN_ENV';
      const authorUsernameToSave = session?.username || 'SuperAdmin';

      const updateData = {
        title: data.title,
        content: data.content,
        excerpt: data.excerpt,
        category: data.category,
        imageUrl: data.imageUrl,
        dataAiHint: data.dataAiHint,
        authorId: authorIdToSave,
        inlineAdSnippets: data.inlineAdSnippetsInput?.split('\n\n').map(s => s.trim()).filter(s => s !== '') || [],
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        metaKeywords: data.metaKeywords, // Remove split() here, as ArticleForm already handles it
        ogTitle: data.ogTitle,
        ogDescription: data.ogDescription,
        ogImage: data.ogImage,
        canonicalUrl: data.canonicalUrl,
        articleYoutubeUrl: data.articleYoutubeUrl,
        articleFacebookUrl: data.articleFacebookUrl,
        articleMoreLinksUrl: data.articleMoreLinksUrl,
        displayPlacements: data.displayPlacements,
        detailsPageCategories: data.detailsPageCategories,
        detailsPageSpecificPosts: data.detailsPageSpecificPosts,
      };

      // const result = await updateNewsArticle(article.id, updateData); // Old direct server action call
      const response = await fetch('/api/articles', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: article.id, ...updateData }),
      });

      if (response.ok) {
        const result = await response.json();
        toast({ title: "Success", description: "Article updated successfully." });
        
        await addActivityLogEntry({ 
          userId: authorIdToSave, 
          username: authorUsernameToSave, 
          action: 'article_updated', 
          targetType: 'article', 
          targetId: article.id,
          details: { updatedTitle: result.title, fieldsUpdated: Object.keys(updateData) }
        });

        // Redirect back to dashboard
        router.push('/admin/dashboard');
      } else {
        toast({ title: "Error", description: "Failed to update article.", variant: "destructive" });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      toast({ 
        title: "Error", 
        description: `Failed to update article: ${errorMessage}`, 
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[calc(100vh-20rem)]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 text-lg text-muted-foreground">Loading article...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="container mx-auto py-8">
        <Card className="w-full max-w-md mx-auto shadow-lg border-destructive">
          <CardHeader className="bg-destructive/10">
            <CardTitle className="text-xl text-destructive flex items-center justify-center">
              <AlertTriangle className="mr-2 h-6 w-6" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-muted-foreground mb-4">
              {error || "Article not found"}
            </p>
            <Button asChild>
              <Link href="/admin/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Convert article data to form data format
  const initialFormData: ArticleFormData = {
    title: article.title,
    content: article.content,
    excerpt: article.excerpt,
    category: article.category,
    imageUrl: article.imageUrl,
    dataAiHint: article.dataAiHint,
    inlineAdSnippetsInput: article.inlineAdSnippets?.join('\n\n') || '',
    metaTitle: article.metaTitle,
    metaDescription: article.metaDescription,
    metaKeywords: article.metaKeywords?.join(', ') || '',
    ogTitle: article.ogTitle,
    ogDescription: article.ogDescription,
    ogImage: article.ogImage,
    canonicalUrl: article.canonicalUrl,
    articleYoutubeUrl: article.articleYoutubeUrl,
    articleFacebookUrl: article.articleFacebookUrl,
    articleMoreLinksUrl: article.articleMoreLinksUrl,
  };

  return (
    <ErrorBoundary 
      fallback={
        <div className="container mx-auto p-4 py-8 text-center">
          <Card className="w-full max-w-md mx-auto shadow-lg border-destructive">
            <CardHeader className="bg-destructive/10">
              <CardTitle className="text-xl text-destructive flex items-center justify-center">
                <AlertTriangle className="mr-2 h-6 w-6" />
                Edit Article Error
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">
                An error occurred while editing the article. Please try again.
              </p>
              <Button className="mt-4" onClick={() => window.location.reload()}>
                Reload Page
              </Button>
            </CardContent>
          </Card>
        </div>
      }
    >
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/admin/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-primary">
                Edit Article: {article.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ArticleForm 
                article={article}
                onSubmit={handleSubmit}
                onCancel={() => router.push('/admin/dashboard')}
                isSubmitting={isSubmitting}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </ErrorBoundary>
  );
} 