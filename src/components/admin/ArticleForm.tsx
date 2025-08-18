
"use client";

import type { ChangeEvent } from "react";
import { useState, useEffect, useRef } from "react";
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
import type { NewsArticle, Category, CreateNewsArticleData, UnifiedPlacement, PlacementConfig } from "@/lib/types";
import { categories as allNewsCategories, UNIFIED_PLACEMENTS, getPlacementsByCategory } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Info, Loader2, Youtube, Facebook, Link as LinkIcon, CheckSquare, Square, Plus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox"; // Import Checkbox component

const articleFormSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters." }).max(150),
  content: z.string().min(20, { message: "Content must be at least 20 characters." }),
  excerpt: z.string().min(10, { message: "Excerpt must be at least 10 characters." }).max(300),
  category: z.string().refine(val => allNewsCategories.includes(val as Category) || val === "", { message: "Please select a valid category."}),
  imageUrl: z.string().optional().or(z.literal('')),
  dataAiHint: z.string().max(50).optional().or(z.literal('')),
  inlineAdSnippetsInput: z.string().optional(),

  // New unified placement system
  unifiedPlacements: z.array(z.string()).optional(),
  
  // Field for category-based filtering for details page articles
  detailsPageCategories: z.array(z.string()).optional(),
  
  // Field for specific post targeting for details page articles
  detailsPageSpecificPosts: z.array(z.string()).optional(),

  // Text Links for clickable content
  textLinks: z.array(z.object({
    text: z.string().min(1, "Link text is required"),
    url: z.string().url("Must be a valid URL")
  })).optional(),

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

export default function ArticleForm({ article, onSubmit, onCancel, isSubmitting }: ArticleFormProps) {
  const { toast } = useToast();
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const [selectedUnifiedPlacements, setSelectedUnifiedPlacements] = useState<UnifiedPlacement[]>(article?.displayPlacements || []);
  const [availableArticles, setAvailableArticles] = useState<NewsArticle[]>([]);
  const [isLoadingArticles, setIsLoadingArticles] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>((article as any)?.detailsPageCategories || []);
  const [textLinks, setTextLinks] = useState<Array<{text: string, url: string}>>((article as any)?.textLinks || []);
  
  const hasDetailsPagePlacement = selectedUnifiedPlacements.some(placement => 
    ['article-related', 'article-sidebar', 'article-sidebar-left', 'article-sidebar-right'].includes(placement)
  );

  const handleInsertAdInline = () => {
    if (contentRef.current) {
      const textarea = contentRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;
      const newValue = value.slice(0, start) + '[AD_INLINE]' + value.slice(end);
      textarea.value = newValue;
      textarea.selectionStart = textarea.selectionEnd = start + '[AD_INLINE]'.length;
      textarea.focus();
    }
  };

  const handleAddTextLink = () => {
    setTextLinks([...textLinks, { text: '', url: '' }]);
  };

  const handleUpdateTextLink = (index: number, field: 'text' | 'url', value: string) => {
    const newTextLinks = [...textLinks];
    newTextLinks[index] = { ...newTextLinks[index], [field]: value };
    setTextLinks(newTextLinks);
  };

  const handleRemoveTextLink = (index: number) => {
    setTextLinks(textLinks.filter((_, i) => i !== index));
  };

  const handleInsertTextLink = (index: number) => {
    const link = textLinks[index];
    if (link.text && link.url && contentRef.current) {
      const textarea = contentRef.current;
      const start = textarea.selectionStart;
      const value = textarea.value;
      const linkHtml = `<a href="${link.url}" target="_blank" rel="noopener noreferrer">${link.text}</a>`;
      const newValue = value.slice(0, start) + linkHtml + value.slice(start);
      textarea.value = newValue;
      textarea.selectionStart = textarea.selectionEnd = start + linkHtml.length;
      textarea.focus();
      toast({
        title: "Link Inserted",
        description: `"${link.text}" link has been inserted into the content.`,
      });
    } else {
      toast({
        title: "Error",
        description: "Please fill in both text and URL for the link.",
        variant: "destructive",
      });
    }
  };

  const handleInsertTextLinkFromSelection = () => {
    if (contentRef.current) {
      const textarea = contentRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.slice(start, end);
      
      if (start === end) {
        toast({
          title: "No Text Selected",
          description: "Please select some text first, then click 'Make Text Clickable'.",
          variant: "destructive",
        });
        return;
      }
      
      // Prompt user for URL
      const url = prompt(`Enter URL for "${selectedText}":`, "https://");
      
      if (url && url.trim()) {
        try {
          // Validate URL
          new URL(url);
          
          const value = textarea.value;
          const linkHtml = `<a href="${url.trim()}" target="_blank" rel="noopener noreferrer">${selectedText}</a>`;
          const newValue = value.slice(0, start) + linkHtml + value.slice(end);
          
          textarea.value = newValue;
          textarea.selectionStart = textarea.selectionEnd = start + linkHtml.length;
          textarea.focus();
          
          toast({
            title: "Text Made Clickable",
            description: `"${selectedText}" is now a clickable link.`,
          });
        } catch (error) {
          toast({
            title: "Invalid URL",
            description: "Please enter a valid URL starting with http:// or https://",
            variant: "destructive",
          });
        }
      }
    }
  };
  
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
      unifiedPlacements: article?.displayPlacements || [], // Initialize unified placements
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
    ? availableArticles.filter(article => selectedCategories.includes(article.category))
    : availableArticles;

  // Group placements by category for better organization
  const homepagePlacements = UNIFIED_PLACEMENTS.filter(p => p.category === 'homepage');
  const detailsPagePlacements = UNIFIED_PLACEMENTS.filter(p => p.category === 'details');
  const headerFooterPlacements = UNIFIED_PLACEMENTS.filter(p => ['header', 'footer'].includes(p.category));
  const sidebarPlacements = UNIFIED_PLACEMENTS.filter(p => p.category === 'sidebar');

  const handlePlacementToggle = (placement: UnifiedPlacement) => {
    setSelectedUnifiedPlacements(prev => {
      if (prev.includes(placement)) {
        return prev.filter(p => p !== placement);
      } else {
        return [...prev, placement];
      }
    });
  };

  const getPlacementSizeBadge = (size: string) => {
    const sizeColors = {
      'small': 'bg-gray-100 text-gray-700',
      'medium': 'bg-blue-100 text-blue-700',
      'large': 'bg-green-100 text-green-700',
      'full-width': 'bg-purple-100 text-purple-700'
    };
    
    return (
      <span className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${sizeColors[size as keyof typeof sizeColors] || 'bg-gray-100 text-gray-700'}`}>
        {size}
      </span>
    );
  };

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
        textLinks: textLinks, // Include text links
        displayPlacements: (data.unifiedPlacements as UnifiedPlacement[]) || [], // Include unified placements
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
              <FormLabel className="text-black">Title</FormLabel>
              <FormControl><Input placeholder="Enter article title" {...field} className="border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="excerpt"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-black">Excerpt</FormLabel>
              <FormControl><Textarea placeholder="Enter a short excerpt (summary)" {...field} rows={3} className="border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" /></FormControl>
              <FormDescription className="text-black">
                A brief summary of the article (max 160 characters for SEO).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }: { field: any }) => (
            <FormItem className="relative">
              <div className="flex items-center gap-2 mb-2">
                <FormLabel className="text-black">Content</FormLabel>
                <Button type="button" variant="secondary" size="sm" onClick={handleInsertAdInline} className="bg-gray-100 text-black hover:bg-gray-200 border border-gray-300">
                  Insert Ad (Label)
                </Button>
              </div>
              <div className="flex gap-2 mb-2">
                <Button type="button" variant="secondary" size="sm" onClick={handleInsertAdInline} className="bg-gray-100 text-black hover:bg-gray-200 border border-gray-300">
                  Insert Ad (Above)
                </Button>
                <Button type="button" variant="secondary" size="sm" onClick={handleInsertTextLinkFromSelection} className="bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-300">
                  Make Text Clickable
                </Button>
              </div>
              <FormControl>
                <div className="relative">
                  <Textarea 
                    {...field} 
                    ref={contentRef} 
                    rows={16} 
                    placeholder="Enter the full article content. Use [AD_INLINE] where you want inline ads. Select text and use 'Make Text Clickable' to add links." 
                    className="border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                  <Button type="button" variant="secondary" size="icon" onClick={handleInsertAdInline} className="absolute top-2 right-2 z-10 bg-gray-100 text-black hover:bg-gray-200 border border-gray-300">
                    +
                  </Button>
                </div>
              </FormControl>
              <div className="flex gap-2 mt-2">
                <Button type="button" variant="secondary" size="sm" onClick={handleInsertAdInline} className="bg-gray-100 text-black hover:bg-gray-200 border border-gray-300">
                  Insert Ad (Below)
                </Button>
                <Button type="button" variant="secondary" size="sm" onClick={handleInsertTextLinkFromSelection} className="bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-300">
                  Make Text Clickable
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Text Links Section */}
        <FormItem>
          <FormLabel className="text-black">Text Links</FormLabel>
          <FormDescription className="text-black">
            Add clickable text links that will be available to insert into your content. These links will be clickable when the post is published.
          </FormDescription>
          
          <div className="space-y-3">
            {textLinks.map((link, index) => (
              <div key={index} className="flex gap-2 items-start p-3 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex-1 space-y-2">
                  <Input
                    placeholder="Link text (e.g., 'Read More', 'Learn More')"
                    value={link.text}
                    onChange={(e) => handleUpdateTextLink(index, 'text', e.target.value)}
                    className="border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                  <Input
                    placeholder="URL (e.g., https://example.com)"
                    value={link.url}
                    onChange={(e) => handleUpdateTextLink(index, 'url', e.target.value)}
                    className="border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleInsertTextLink(index)}
                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                    disabled={!link.text || !link.url}
                  >
                    <LinkIcon className="h-4 w-4 mr-1" />
                    Insert
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveTextLink(index)}
                    className="border-red-200 text-red-700 hover:bg-red-50"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              onClick={handleAddTextLink}
              className="border-2 border-dashed border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600 w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Text Link
            </Button>
          </div>
        </FormItem>
        
         <FormField
          control={form.control}
          name="inlineAdSnippetsInput"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-black">Inline Ad Snippets</FormLabel>
              <FormControl><Textarea placeholder="Paste ad code snippets here, separated by a blank line." {...field} rows={6} className="border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" /></FormControl>
              <FormDescription className="text-black">
                Paste ad code snippets separated by blank lines. These will be automatically inserted where [AD_INLINE] markers are placed in the content.
              </FormDescription>
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
            <Input type="file" accept="image/*" onChange={handleImageUpload} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" />
          </FormControl>
          <FormDescription className="text-black">
            Upload an image or provide a URL. Images are automatically optimized.
          </FormDescription>
        </FormItem>
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-black">Image URL</FormLabel>
              <div className="space-y-2">
                <Input type="file" accept="image/*" onChange={handleImageUpload} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" />
                <FormControl><Input placeholder="https://example.com/image.jpg or auto-filled" {...field} className="border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" /></FormControl>
              </div>
              <FormDescription className="text-black">
                Upload an image or provide a URL. Images are automatically optimized.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dataAiHint"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-black">AI Data Hint</FormLabel>
              <FormControl><Input placeholder="e.g., technology abstract" {...field} className="border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" /></FormControl>
              <FormDescription className="text-black">
                Optional hint for AI to understand the image content for better SEO.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Enhanced section for Display Placements */}
        <FormField
          control={form.control}
          name="unifiedPlacements"
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
                                 {homepagePlacements.map((placement) => (
                   <FormField
                     key={placement.placement}
                     control={form.control}
                     name="unifiedPlacements"
                     render={({ field }) => {
                       return (
                         <FormItem
                           key={placement.placement}
                           className="flex flex-row items-start space-x-3 space-y-0 mb-3"
                         >
                           <FormControl>
                             <Checkbox
                               checked={field.value?.includes(placement.placement)}
                               onCheckedChange={(checked) => {
                                 const newValue = checked
                                   ? [...(field.value || []), placement.placement]
                                   : field.value?.filter((value) => value !== placement.placement);
                                 field.onChange(newValue);
                                 setSelectedUnifiedPlacements((newValue as UnifiedPlacement[]) || []);
                               }}
                             />
                           </FormControl>
                           <div>
                             <FormLabel className="font-normal">
                               {placement.placement.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                             </FormLabel>
                             <p className="text-xs text-gray-500 mt-1">{placement.description}</p>
                             {placement.size && (
                               <p className="text-xs text-gray-500 mt-1">Size: {getPlacementSizeBadge(placement.size)}</p>
                             )}
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
                                 {detailsPagePlacements.map((placement) => (
                   <FormField
                     key={placement.placement}
                     control={form.control}
                     name="unifiedPlacements"
                     render={({ field }) => {
                       return (
                         <FormItem
                           key={placement.placement}
                           className="flex flex-row items-start space-x-3 space-y-0 mb-3"
                         >
                           <FormControl>
                             <Checkbox
                               checked={field.value?.includes(placement.placement)}
                               onCheckedChange={(checked) => {
                                 const newValue = checked
                                   ? [...(field.value || []), placement.placement]
                                   : field.value?.filter((value) => value !== placement.placement);
                                 field.onChange(newValue);
                                 setSelectedUnifiedPlacements((newValue as UnifiedPlacement[]) || []);
                               }}
                             />
                           </FormControl>
                           <div>
                             <FormLabel className="font-normal">
                               {placement.placement.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                             </FormLabel>
                             <p className="text-xs text-gray-500 mt-1">{placement.description}</p>
                             {placement.size && (
                               <p className="text-xs text-gray-500 mt-1">Size: {getPlacementSizeBadge(placement.size)}</p>
                             )}
                           </div>
                         </FormItem>
                       );
                     }}
                   />
                 ))}
              </div>

              {/* Header/Footer Placements */}
              <div className="mb-6">
                <h4 className="font-medium text-sm mb-3 text-purple-600">Header/Footer Placements</h4>
                                 {headerFooterPlacements.map((placement) => (
                   <FormField
                     key={placement.placement}
                     control={form.control}
                     name="unifiedPlacements"
                     render={({ field }) => {
                       return (
                         <FormItem
                           key={placement.placement}
                           className="flex flex-row items-start space-x-3 space-y-0 mb-3"
                         >
                           <FormControl>
                             <Checkbox
                               checked={field.value?.includes(placement.placement)}
                               onCheckedChange={(checked) => {
                                 const newValue = checked
                                   ? [...(field.value || []), placement.placement]
                                   : field.value?.filter((value) => value !== placement.placement);
                                 field.onChange(newValue);
                                 setSelectedUnifiedPlacements((newValue as UnifiedPlacement[]) || []);
                               }}
                             />
                           </FormControl>
                           <div>
                             <FormLabel className="font-normal">
                               {placement.placement.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                             </FormLabel>
                             <p className="text-xs text-gray-500 mt-1">{placement.description}</p>
                             {placement.size && (
                               <p className="text-xs text-gray-500 mt-1">Size: {getPlacementSizeBadge(placement.size)}</p>
                             )}
                           </div>
                         </FormItem>
                       );
                     }}
                   />
                 ))}
              </div>

              {/* Sidebar Placements */}
              <div className="mb-6">
                <h4 className="font-medium text-sm mb-3 text-indigo-600">Sidebar Placements</h4>
                                 {sidebarPlacements.map((placement) => (
                   <FormField
                     key={placement.placement}
                     control={form.control}
                     name="unifiedPlacements"
                     render={({ field }) => {
                       return (
                         <FormItem
                           key={placement.placement}
                           className="flex flex-row items-start space-x-3 space-y-0 mb-3"
                         >
                           <FormControl>
                             <Checkbox
                               checked={field.value?.includes(placement.placement)}
                               onCheckedChange={(checked) => {
                                 const newValue = checked
                                   ? [...(field.value || []), placement.placement]
                                   : field.value?.filter((value) => value !== placement.placement);
                                 field.onChange(newValue);
                                 setSelectedUnifiedPlacements((newValue as UnifiedPlacement[]) || []);
                               }}
                             />
                           </FormControl>
                           <div>
                             <FormLabel className="font-normal">
                               {placement.placement.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                             </FormLabel>
                             <p className="text-xs text-gray-500 mt-1">{placement.description}</p>
                             {placement.size && (
                               <p className="text-xs text-gray-500 mt-1">Size: {getPlacementSizeBadge(placement.size)}</p>
                             )}
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
                    <FormLabel className="text-black">Meta Title</FormLabel>
                    <FormControl><Input placeholder="Custom meta title for this article" {...field} className="border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" /></FormControl>
                    <FormDescription className="text-black">
                      Custom meta title for search engines (overrides default).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="metaDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-black">Meta Description</FormLabel>
                    <FormControl><Textarea placeholder="Custom meta description for this article" {...field} rows={3} className="border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"/></FormControl>
                    <FormDescription className="text-black">
                      Custom meta description for search engines (overrides default).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="metaKeywords"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-black">Meta Keywords</FormLabel>
                    <FormControl><Input placeholder="keywordA, keywordB, keywordC" {...field} className="border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" /></FormControl>
                    <FormDescription className="text-black">
                      Comma-separated keywords for this article.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ogTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-black">Open Graph Title</FormLabel>
                    <FormControl><Input placeholder="Custom OG title for social sharing" {...field} className="border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" /></FormControl>
                    <FormDescription className="text-black">
                      Custom title for social media sharing (overrides meta title).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ogDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-black">Open Graph Description</FormLabel>
                    <FormControl><Textarea placeholder="Custom OG description for social sharing" {...field} rows={3} className="border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"/></FormControl>
                    <FormDescription className="text-black">
                      Custom description for social media sharing (overrides meta description).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ogImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-black">Open Graph Image</FormLabel>
                    <FormControl><Input type="url" placeholder="https://example.com/custom-og-image.jpg" {...field} className="border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" /></FormControl>
                    <FormDescription className="text-black">
                      Custom image for social media sharing (overrides article image).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="canonicalUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-black">Canonical URL</FormLabel>
                    <FormControl><Input type="url" placeholder="https://example.com/original-article-url" {...field} className="border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" /></FormControl>
                    <FormDescription className="text-black">
                      Original URL if this is a republished article.
                    </FormDescription>
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
                    <FormLabel className="text-black">YouTube URL</FormLabel>
                    <FormControl><Input type="url" placeholder="https://youtube.com/watch?v=relevantvideo" {...field} className="border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" /></FormControl>
                    <FormDescription className="text-black">
                      Related YouTube video URL for this article.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="articleFacebookUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-black">Facebook URL</FormLabel>
                    <FormControl><Input type="url" placeholder="https://facebook.com/relevantpost" {...field} className="border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" /></FormControl>
                    <FormDescription className="text-black">
                      Related Facebook post URL for this article.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="articleMoreLinksUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-black">More Links URL</FormLabel>
                    <FormControl><Input type="url" placeholder="https://example.com/related-resource" {...field} className="border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" /></FormControl>
                    <FormDescription className="text-black">
                      Additional resource or related content URL.
                    </FormDescription>
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
