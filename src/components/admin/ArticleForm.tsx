
"use client";

import type { ChangeEvent } from "react";
import { useState, useEffect } from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { NewsArticle, Category, CreateNewsArticleData, ArticleDisplayLocation } from "@/lib/types";
import { categories as allNewsCategories } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Info, Loader2, Youtube, Facebook, Link as LinkIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox"; // Import Checkbox component

const articleFormSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters." }).max(150),
  content: z.string().min(20, { message: "Content must be at least 20 characters." }),
  excerpt: z.string().min(10, { message: "Excerpt must be at least 10 characters." }).max(300),
  category: z.string().refine(val => allNewsCategories.includes(val as Category) || val === "", { message: "Please select a valid category."}),
  imageUrl: z.string().optional().or(z.literal('')),
  dataAiHint: z.string().max(50).optional().or(z.literal('')),
  inlineAdSnippetsInput: z.string().optional(),

  // New field for display placements
  displayPlacements: z.array(z.enum(['homepage-hero', 'homepage-latest-posts', 'homepage-more-headlines', 'sidebar-must-read', 'article-related', 'article-sidebar'])).optional(),
  
  // Field for category-based filtering for details page articles
  detailsPageCategories: z.array(z.string()).optional(),
  
  // Field for specific post targeting for details page articles
  detailsPageSpecificPosts: z.array(z.string()).optional(),

  // SEO Fields
  metaTitle: z.string().max(70, "Meta title should be 70 chars or less.").optional().or(z.literal('')),
  metaDescription: z.string().max(160, "Meta description should be 160 chars or less.").optional().or(z.literal('')),
  metaKeywords: z.string().optional().or(z.literal('')), // Comma-separated
  ogTitle: z.string().max(70).optional().or(z.literal('')),
  ogDescription: z.string().max(200).optional().or(z.literal('')), // OG descriptions can be a bit longer
  ogImage: z.string().url("Must be a valid URL for OG image.").optional().or(z.literal('')),
  canonicalUrl: z.string().url("Must be a valid canonical URL.").optional().or(z.literal('')),

  // Article-specific social links
  articleYoutubeUrl: z.string().url("Must be a valid YouTube URL.").optional().or(z.literal('')),
  articleFacebookUrl: z.string().url("Must be a valid Facebook URL.").optional().or(z.literal('')),
  articleMoreLinksUrl: z.string().url("Must be a valid URL for 'More Links'.").optional().or(z.literal('')),
});

export type ArticleFormData = z.infer<typeof articleFormSchema>;

// This represents the data structure after processing the form input for submission
type ProcessedArticleFormData = CreateNewsArticleData;

interface ArticleFormProps {
  article?: NewsArticle | null;
  onSubmit: (data: ArticleFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const ARTICLE_DISPLAY_LOCATIONS: { 
  label: string; 
  value: ArticleDisplayLocation; 
  description: string; 
  category: 'homepage' | 'details' 
}[] = [
  { 
    label: 'Homepage Hero (Featured)', 
    value: 'homepage-hero', 
    description: 'Main featured article on homepage', 
    category: 'homepage' 
  },
  { 
    label: 'Homepage Latest Posts', 
    value: 'homepage-latest-posts', 
    description: 'Latest news section on homepage', 
    category: 'homepage' 
  },
  { 
    label: 'Homepage More Headlines', 
    value: 'homepage-more-headlines', 
    description: 'More headlines section on homepage', 
    category: 'homepage' 
  },
  { 
    label: 'Sidebar Must Read (Homepage)', 
    value: 'sidebar-must-read', 
    description: 'Must read section on homepage sidebar', 
    category: 'homepage' 
  },
  { 
    label: 'Article Related Posts', 
    value: 'article-related', 
    description: 'Related posts in article details pages', 
    category: 'details' 
  },
  { 
    label: 'Article Sidebar', 
    value: 'article-sidebar', 
    description: 'Sidebar content in article details pages', 
    category: 'details' 
  },
];

export default function ArticleForm({ article, onSubmit, onCancel, isSubmitting }: ArticleFormProps) {
  const { toast } = useToast();
  const [selectedDisplayPlacements, setSelectedDisplayPlacements] = useState<string[]>(article?.displayPlacements || []);
  const [availableArticles, setAvailableArticles] = useState<NewsArticle[]>([]);
  const [isLoadingArticles, setIsLoadingArticles] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>((article as any)?.detailsPageCategories || []);
  
  const hasDetailsPagePlacement = selectedDisplayPlacements.some(placement => 
    ['article-related', 'article-sidebar'].includes(placement)
  );
  
  const form = useForm<ArticleFormData>({
    resolver: zodResolver(articleFormSchema),
    defaultValues: {
      title: article?.title || "",
      content: article?.content || "",
      excerpt: article?.excerpt || "",
      category: article?.category || "",
      imageUrl: article?.imageUrl || "",
      dataAiHint: article?.dataAiHint || "",
      inlineAdSnippetsInput: article?.inlineAdSnippets?.join('\n\n') || "",
      displayPlacements: article?.displayPlacements || [], // Initialize displayPlacements
      detailsPageCategories: (article as any)?.detailsPageCategories || [], // Initialize category filters
      detailsPageSpecificPosts: (article as any)?.detailsPageSpecificPosts || [], // Initialize specific post filters
      // SEO Fields
      metaTitle: article?.metaTitle || "",
      metaDescription: article?.metaDescription || "",
      metaKeywords: article?.metaKeywords?.join(', ') || "",
      ogTitle: article?.ogTitle || "",
      ogDescription: article?.ogDescription || "",
      ogImage: article?.ogImage || "",
      canonicalUrl: article?.canonicalUrl || "",
      // Article-specific social links
      articleYoutubeUrl: article?.articleYoutubeUrl || "",
      articleFacebookUrl: article?.articleFacebookUrl || "",
      articleMoreLinksUrl: article?.articleMoreLinksUrl || "",
    },
  });

  // Watch the form values to sync selectedCategories with the actual form state
  const watchedCategories = form.watch("detailsPageCategories");
  
  // Update selectedCategories when form values change
  useEffect(() => {
    if (watchedCategories) {
      setSelectedCategories(watchedCategories);
    }
  }, [watchedCategories]);

  // Fetch available articles when details page placement is selected
  useEffect(() => {
    if (hasDetailsPagePlacement && availableArticles.length === 0) {
      setIsLoadingArticles(true);
      fetch('/api/articles')
        .then(response => response.json())
        .then(data => {
          const articles = data.articles || [];
          // Filter out the current article if editing
          const filteredArticles = articles.filter((art: NewsArticle) => art.id !== article?.id);
          setAvailableArticles(filteredArticles);
        })
        .catch(error => {
          console.error('Error fetching articles:', error);
          toast({
            title: "Error",
            description: "Failed to load articles for targeting.",
            variant: "destructive",
          });
        })
        .finally(() => {
          setIsLoadingArticles(false);
        });
    }
  }, [hasDetailsPagePlacement, article?.id, toast, availableArticles.length]);

  // Filter available articles based on selected categories
  const filteredAvailableArticles = selectedCategories.length > 0 
    ? availableArticles.filter(art => selectedCategories.includes(art.category))
    : availableArticles;
    
  // Debug logging
  useEffect(() => {
    console.log('Selected categories changed:', selectedCategories);
    console.log('Available articles:', availableArticles.length);
    console.log('Filtered articles:', filteredAvailableArticles.length);
  }, [selectedCategories, availableArticles.length, filteredAvailableArticles.length]);

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "Error",
          description: "Image size should not exceed 5MB.",
          variant: "destructive",
        });
        event.target.value = ""; 
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue("imageUrl", reader.result as string);
        toast({
          title: "Image Selected",
          description: "Image ready for saving.",
        });
      };
      reader.onerror = () => {
        toast({
          title: "Error",
          description: "Failed to read image file.",
          variant: "destructive",
        });
      };
      reader.readAsDataURL(file);
    }
  };

 const handleSubmit = (data: ArticleFormData) => {
    const snippets = data.inlineAdSnippetsInput?.split('\n\n').map(s => s.trim()).filter(s => s !== '') || [];
    const keywordsArray = String(data.metaKeywords || '').split(',').map(k => k.trim()).filter(k => k) || [];

    const finalData: ProcessedArticleFormData = {
        title: data.title,
        content: data.content,
        excerpt: data.excerpt,
        category: data.category as Category,
        imageUrl: data.imageUrl || undefined,
        dataAiHint: data.dataAiHint || undefined,
        inlineAdSnippets: snippets,
        displayPlacements: data.displayPlacements || [], // Include displayPlacements
        detailsPageCategories: data.detailsPageCategories || [], // Include category filters
        detailsPageSpecificPosts: data.detailsPageSpecificPosts || [], // Include specific post filters
        // SEO fields
        metaTitle: data.metaTitle || undefined,
        metaDescription: data.metaDescription || undefined,
        metaKeywords: keywordsArray,
        ogTitle: data.ogTitle || undefined,
        ogDescription: data.ogDescription || undefined,
        ogImage: data.ogImage || undefined,
        canonicalUrl: data.canonicalUrl || undefined,
        // Article-specific social links
        articleYoutubeUrl: data.articleYoutubeUrl || undefined,
        articleFacebookUrl: data.articleFacebookUrl || undefined,
        articleMoreLinksUrl: data.articleMoreLinksUrl || undefined,
    };
    // Type assertion to handle metaKeywords conversion
    onSubmit(finalData as any);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl><Input placeholder="Enter article title" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="excerpt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Excerpt</FormLabel>
              <FormControl><Textarea placeholder="Enter a short excerpt (summary)" {...field} rows={3} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Content</FormLabel>
              <FormControl><Textarea placeholder="Enter the full article content. Use [AD_INLINE] where you want inline ads." {...field} rows={10} /></FormControl>
              <FormDescription>Use `[AD_INLINE]` for inline ad placeholders.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="inlineAdSnippetsInput"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Inline Ad Snippets (Optional)</FormLabel>
              <FormControl><Textarea placeholder="Paste ad code snippets here, separated by a blank line." {...field} rows={6} /></FormControl>
              <FormDescription>Snippets replace `[AD_INLINE]` sequentially.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl>
                <SelectContent>
                  {allNewsCategories.map((cat) => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormItem>
          <FormLabel>Upload Image (Optional)</FormLabel>
          <FormControl>
            <Input type="file" accept="image/*" onChange={handleImageUpload} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
          </FormControl>
          <FormDescription>Max 5MB. Upload populates the URL field below.</FormDescription>
        </FormItem>
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL (or from upload)</FormLabel>
              <FormControl><Input placeholder="https://example.com/image.jpg or auto-filled" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dataAiHint"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image AI Hint (Optional)</FormLabel>
              <FormControl><Input placeholder="e.g., technology abstract" {...field} /></FormControl>
              <FormDescription>1-2 keywords for AI image search (max 2 words).</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Enhanced section for Display Placements */}
        <FormField
          control={form.control}
          name="displayPlacements"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">Display Locations</FormLabel>
                <FormDescription>
                  Select where this article should be featured on the website.
                </FormDescription>
              </div>
              
              {/* Homepage Placements */}
              <div className="mb-6">
                <h4 className="font-medium text-sm mb-3 text-blue-600">Homepage Placements</h4>
                {ARTICLE_DISPLAY_LOCATIONS.filter(item => item.category === 'homepage').map((item) => (
                  <FormField
                    key={item.value}
                    control={form.control}
                    name="displayPlacements"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={item.value}
                          className="flex flex-row items-start space-x-3 space-y-0 mb-3"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(item.value)}
                              onCheckedChange={(checked) => {
                                const newValue = checked
                                  ? [...(field.value || []), item.value]
                                  : field.value?.filter((value) => value !== item.value);
                                field.onChange(newValue);
                                setSelectedDisplayPlacements(newValue || []);
                              }}
                            />
                          </FormControl>
                          <div>
                            <FormLabel className="font-normal">
                              {item.label}
                            </FormLabel>
                            <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                          </div>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>

              {/* Details Page Placements */}
              <div className="mb-6">
                <h4 className="font-medium text-sm mb-3 text-green-600">Article Details Page Placements</h4>
                {ARTICLE_DISPLAY_LOCATIONS.filter(item => item.category === 'details').map((item) => (
                  <FormField
                    key={item.value}
                    control={form.control}
                    name="displayPlacements"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={item.value}
                          className="flex flex-row items-start space-x-3 space-y-0 mb-3"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(item.value)}
                              onCheckedChange={(checked) => {
                                const newValue = checked
                                  ? [...(field.value || []), item.value]
                                  : field.value?.filter((value) => value !== item.value);
                                field.onChange(newValue);
                                setSelectedDisplayPlacements(newValue || []);
                              }}
                            />
                          </FormControl>
                          <div>
                            <FormLabel className="font-normal">
                              {item.label}
                            </FormLabel>
                            <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                          </div>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category Filter for Details Page Articles */}
        {hasDetailsPagePlacement && (
          <FormField
            control={form.control}
            name="detailsPageCategories"
            render={() => (
              <FormItem>
                <div className="mb-4">
                  <FormLabel className="text-base">Category-Based Display for Details Pages</FormLabel>
                  <FormDescription>
                    Select which article categories should trigger this post to appear in their details pages. 
                    If none selected, it will appear in all details pages.
                  </FormDescription>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {allNewsCategories.map((category) => (
                    <FormField
                      key={category}
                      control={form.control}
                      name="detailsPageCategories"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={category}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                                                          <Checkbox
                              checked={field.value?.includes(category)}
                              onCheckedChange={(checked) => {
                                console.log(`Category ${category} ${checked ? 'checked' : 'unchecked'}`);
                                const newCategories = checked
                                  ? [...(field.value || []), category]
                                  : field.value?.filter((value) => value !== category);
                                console.log('New categories:', newCategories);
                                field.onChange(newCategories);
                              }}
                            />
                            </FormControl>
                            <FormLabel className="font-normal text-sm">
                              {category}
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Specific Post Targeting for Details Page Articles */}
        {hasDetailsPagePlacement && (
          <FormField
            control={form.control}
            name="detailsPageSpecificPosts"
            render={() => (
              <FormItem>
                <div className="mb-4">
                  <FormLabel className="text-base">Specific Post Targeting for Details Pages</FormLabel>
                  <FormDescription>
                    Select specific posts where this article should appear in their details pages. 
                    {selectedCategories.length > 0 && (
                      <span className="block mt-1 text-blue-600 font-medium">
                        📋 Showing posts filtered by: {selectedCategories.map(cat => `"${cat}"`).join(', ')}
                      </span>
                    )}
                    {selectedCategories.length === 0 && (
                      <span className="block mt-1 text-gray-600">
                        💡 Select categories above to filter posts, or browse all posts below.
                      </span>
                    )}
                  </FormDescription>
                </div>
                {isLoadingArticles ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-gray-500">Loading available posts...</span>
                  </div>
                ) : (
                  <div className="max-h-60 overflow-y-auto border rounded-md p-3 space-y-2">
                    {availableArticles.length === 0 ? (
                      <p className="text-sm text-gray-500">No posts available for targeting.</p>
                    ) : filteredAvailableArticles.length === 0 ? (
                      <div className="text-center p-4">
                        <p className="text-sm text-gray-500 mb-2">No posts found in selected categories.</p>
                        <p className="text-xs text-gray-400">
                          Try selecting different categories or clear category filters to see all posts.
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="text-xs text-gray-500 mb-2 p-2 bg-blue-50 rounded border-l-2 border-blue-200">
                          📊 Showing {filteredAvailableArticles.length} of {availableArticles.length} posts
                          {selectedCategories.length > 0 && ` from "${selectedCategories.join('", "')}" ${selectedCategories.length === 1 ? 'category' : 'categories'}`}
                        </div>
                        {filteredAvailableArticles.map((availableArticle) => (
                        <FormField
                          key={availableArticle.id}
                          control={form.control}
                          name="detailsPageSpecificPosts"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={availableArticle.id}
                                className="flex flex-row items-start space-x-3 space-y-0 p-2 border rounded hover:bg-gray-50"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(availableArticle.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...(field.value || []), availableArticle.id])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== availableArticle.id
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <div className="flex-1">
                                  <FormLabel className="font-normal text-sm leading-tight">
                                    {availableArticle.title}
                                  </FormLabel>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Category: {availableArticle.category} | 
                                    Published: {new Date(availableArticle.publishedDate).toLocaleDateString()}
                                  </p>
                                </div>
                              </FormItem>
                            );
                          }}
                        />
                        ))}
                      </>
                    )}
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="seo-settings">
            <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                <div className="flex items-center gap-2">
                    <Info className="h-5 w-5" /> Advanced SEO Settings (Optional)
                </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-6 pt-4">
              <p className="text-sm text-muted-foreground">
                Override global SEO settings for this specific article. If left blank, defaults will be used (e.g., article title for meta title).
              </p>
              <FormField
                control={form.control}
                name="metaTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta Title</FormLabel>
                    <FormControl><Input placeholder="Custom meta title for this article" {...field} /></FormControl>
                    <FormDescription>Max 70 characters. If blank, article title is used.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="metaDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta Description</FormLabel>
                    <FormControl><Textarea placeholder="Custom meta description for this article" {...field} rows={3}/></FormControl>
                    <FormDescription>Max 160 characters. If blank, article excerpt is used.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="metaKeywords"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta Keywords (comma-separated)</FormLabel>
                    <FormControl><Input placeholder="keywordA, keywordB, keywordC" {...field} /></FormControl>
                     <FormDescription>Specific keywords for this article.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ogTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Open Graph Title</FormLabel>
                    <FormControl><Input placeholder="Custom OG title for social sharing" {...field} /></FormControl>
                    <FormDescription>If blank, meta title or article title is used.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ogDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Open Graph Description</FormLabel>
                    <FormControl><Textarea placeholder="Custom OG description for social sharing" {...field} rows={3}/></FormControl>
                    <FormDescription>If blank, meta description or excerpt is used.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ogImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Open Graph Image URL</FormLabel>
                    <FormControl><Input type="url" placeholder="https://example.com/custom-og-image.jpg" {...field} /></FormControl>
                    <FormDescription>If blank, article's main image is used.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="canonicalUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Canonical URL</FormLabel>
                    <FormControl><Input type="url" placeholder="https://example.com/original-article-url" {...field} /></FormControl>
                    <FormDescription>If this article is a reprint or syndicated, specify the original URL.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="article-social-links">
            <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                <div className="flex items-center gap-2">
                    <LinkIcon className="h-5 w-5" /> Article-Specific Social Links (Optional)
                </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-6 pt-4">
                 <p className="text-sm text-muted-foreground">
                Provide links related to this article for display on the article page (e.g., a relevant YouTube video).
              </p>
               <FormField
                control={form.control}
                name="articleYoutubeUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1"><Youtube className="h-4 w-4"/>YouTube URL</FormLabel>
                    <FormControl><Input type="url" placeholder="https://youtube.com/watch?v=relevantvideo" {...field} /></FormControl>
                    <FormDescription>A YouTube link specifically for this article.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="articleFacebookUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1"><Facebook className="h-4 w-4"/>Facebook Post/Page URL</FormLabel>
                    <FormControl><Input type="url" placeholder="https://facebook.com/relevantpost" {...field} /></FormControl>
                    <FormDescription>A Facebook link specifically for this article.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="articleMoreLinksUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1"><LinkIcon className="h-4 w-4"/>More Related Links URL</FormLabel>
                    <FormControl><Input type="url" placeholder="https://example.com/related-resource" {...field} /></FormControl>
                    <FormDescription>Another relevant link for this article.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="animate-spin mr-2"/> : null}
            {isSubmitting ? (article ? "Saving..." : "Adding..." ): (article ? "Save Changes" : "Add Article")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
