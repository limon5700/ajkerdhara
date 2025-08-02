"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ArticleForm, { type ArticleFormData } from "@/components/admin/ArticleForm";
import { addNewsArticle, addActivityLogEntry } from "@/lib/data";
import { getSession } from "@/app/admin/auth/actions";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function AddArticlePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleFormSubmit = async (data: ArticleFormData) => {
    setIsSubmitting(true);
    setPageError(null);
    try {
      const session = await getSession();
      const authorIdToSave = session?.userId || 'SUPERADMIN_ENV';
      const authorUsernameToSave = session?.username || 'SuperAdmin';
      // Convert metaKeywords to string[] for backend
      const createData = {
        title: data.title,
        content: data.content,
        excerpt: data.excerpt,
        category: data.category,
        imageUrl: data.imageUrl,
        dataAiHint: data.dataAiHint,
        authorId: authorIdToSave,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        metaKeywords: typeof data.metaKeywords === 'string' ? data.metaKeywords.split(',').map(k => k.trim()).filter(k => k) : [],
        ogTitle: data.ogTitle,
        ogDescription: data.ogDescription,
        ogImage: data.ogImage,
        canonicalUrl: data.canonicalUrl,
        articleYoutubeUrl: data.articleYoutubeUrl,
        articleFacebookUrl: data.articleFacebookUrl,
        articleMoreLinksUrl: data.articleMoreLinksUrl,
      };
      const result = await addNewsArticle(createData);
      if (result) {
        toast({ title: "Success", description: "Article added successfully." });
        await addActivityLogEntry({ 
          userId: authorIdToSave, 
          username: authorUsernameToSave, 
          action: 'article_created', 
          targetType: 'article', 
          targetId: result.id,
          details: { newTitle: result.title }
        });
        router.push("/admin/dashboard");
      } else {
        toast({ title: "Error", description: "Failed to add article.", variant: "destructive" });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      setPageError(errorMessage);
      toast({ title: "Error", description: `An error occurred while saving the article: ${errorMessage}`, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="shadow-lg rounded-xl max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Add New Article</CardTitle>
          <CardDescription>Fill in the details to create a new news article.</CardDescription>
        </CardHeader>
        <CardContent>
          {pageError && <div className="mb-4 text-destructive">{pageError}</div>}
          <ArticleForm
            article={null}
            onSubmit={(finalData) => handleFormSubmit(finalData)}
            onCancel={() => router.push("/admin/dashboard")}
            isSubmitting={isSubmitting}
          />
        </CardContent>
      </Card>
    </div>
  );
} 