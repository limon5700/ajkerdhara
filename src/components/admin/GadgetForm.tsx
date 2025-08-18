
"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Megaphone, 
  Settings, 
  Target, 
  Monitor, 
  FileText,
  Zap,
  Eye
} from "lucide-react";
import type { Gadget, LayoutSection, UnifiedPlacement, PlacementSize } from "@/lib/types";
import { UNIFIED_PLACEMENTS, getPlacementConfig } from "@/lib/constants";
import { formatSectionName } from "@/lib/utils";

// Map unified placements to layout sections
const placementToSectionMap: Record<UnifiedPlacement, LayoutSection> = {
  // 🏠 Homepage Placements (12 sections)
  'homepage-hero': 'homepage-top',
  'homepage-top': 'homepage-top',
  'homepage-latest-posts': 'homepage-latest-posts',
  'homepage-more-headlines': 'homepage-more-headlines',
  'homepage-sidebar-must-read': 'sidebar-right',
  'homepage-content-bottom': 'homepage-content-bottom',
  'homepage-article-interstitial': 'homepage-article-interstitial',
  'homepage-sidebar-top': 'sidebar-right',
  'homepage-sidebar-middle': 'sidebar-right',
  'homepage-sidebar-bottom': 'sidebar-right',
  'homepage-category-banner': 'homepage-top',
  'homepage-breaking-news': 'homepage-top',
  
  // 📄 Article Details Page Placements (12 sections)
  'article-top': 'article-top',
  'article-bottom': 'article-bottom',
  'article-related': 'article-related',
  'article-sidebar-left': 'sidebar-left',
  'article-sidebar-right': 'sidebar-right',
  'article-details-page': 'article-details-page',
  'article-details-sidebar': 'article-details-sidebar',
  'article-inline': 'article-inline',
  'article-comments-top': 'article-top',
  'article-comments-bottom': 'article-bottom',
  'article-social-share': 'article-top',
  'article-author-bio': 'article-bottom',
  
  // 🏷️ Category Page Placements (6 sections)
  'category-header': 'homepage-top',
  'category-top': 'homepage-top',
  'category-middle': 'homepage-top',
  'category-bottom': 'homepage-top',
  'category-sidebar': 'sidebar-right',
  'category-pagination': 'homepage-top',
  
  // 🔍 Search Results Placements (4 sections)
  'search-results-top': 'homepage-top',
  'search-results-bottom': 'homepage-top',
  'search-results-sidebar': 'sidebar-right',
  'search-no-results': 'homepage-top',
  
  // 📱 Mobile-Specific Placements (3 sections)
  'mobile-sticky-bottom': 'homepage-top',
  'mobile-interstitial': 'homepage-article-interstitial',
  'mobile-notification': 'below-header',
  
  // 🎥 Video/Media Placements (6 sections)
  'video-player-top': 'article-top',
  'video-player-bottom': 'article-bottom',
  'video-player-sidebar': 'sidebar-right',
  'gallery-top': 'article-top',
  'gallery-bottom': 'article-bottom',
  'gallery-interstitial': 'article-inline',
  
  // 📧 Newsletter/Subscription Placements (3 sections)
  'newsletter-signup': 'homepage-content-bottom',
  'subscription-popup': 'homepage-top',
  'subscription-banner': 'below-header',
  
  // ⚠️ Error Page Placements (3 sections)
  'error-404': 'homepage-top',
  'error-500': 'homepage-top',
  'error-maintenance': 'homepage-top',
  
  // ⏳ Loading/Transition Placements (3 sections)
  'loading-screen': 'homepage-top',
  'page-transition': 'homepage-top',
  'skeleton-loading': 'homepage-top',
  
  // 📍 Header/Footer Placements (8 sections)
  'header-logo-area': 'header-logo-area',
  'below-header': 'below-header',
  'header-top-banner': 'below-header',
  'header-announcement': 'below-header',
  'footer': 'footer',
  'footer-top': 'footer',
  'footer-middle': 'footer',
  'footer-bottom': 'footer',
  'footer-newsletter': 'footer',
  
  // 📊 Sidebar Placements (9 sections)
  'sidebar-left': 'sidebar-left',
  'sidebar-right': 'sidebar-right',
  'sidebar-must-read': 'sidebar-right',
  'sidebar-popular': 'sidebar-right',
  'sidebar-trending': 'sidebar-right',
  'sidebar-category-list': 'sidebar-right',
  'sidebar-tag-cloud': 'sidebar-right',
  'sidebar-about': 'sidebar-right',
  'sidebar-contact': 'sidebar-right',
  
  // 📝 Special Content Placements (4 sections)
  'content-break': 'article-inline',
  'content-interstitial': 'homepage-article-interstitial',
  'content-highlight': 'homepage-top',
  'content-summary': 'homepage-top',
  
  // 🔄 Auto Injection Placements (2 sections)
  'auto-inject-5': 'homepage-article-interstitial',
  'auto-inject-10': 'homepage-article-interstitial',
  
  // 🖼️ Media & Image Placements (4 sections)
  'image-gallery': 'article-inline',
  'post-image-overlay': 'article-inline',
  'post-content-middle': 'article-inline',
  'post-content-bottom': 'article-bottom',
  
  // 📰 Advanced Content Placements (4 sections)
  'related-posts-between': 'article-related',
  'must-read-between': 'sidebar-right',
  'category-listing': 'homepage-top',
};

const gadgetFormSchema = z.object({
  section: z.custom<LayoutSection>((val) => typeof val === 'string' && val.length > 0),
  title: z.string().max(100).optional().or(z.literal('')),
  content: z.string().min(10, { message: "Gadget content (HTML/JS) must be at least 10 characters." }),
  isActive: z.boolean().default(true),
  order: z.coerce.number().optional(),
  
  // New unified placement system - All 80+ Placement Sections
  unifiedPlacement: z.enum([
    // 🏠 Homepage Placements (12 sections)
    'homepage-hero', 'homepage-top', 'homepage-latest-posts', 'homepage-more-headlines', 
    'homepage-sidebar-must-read', 'homepage-content-bottom', 'homepage-article-interstitial',
    'homepage-sidebar-top', 'homepage-sidebar-middle', 'homepage-sidebar-bottom',
    'homepage-category-banner', 'homepage-breaking-news',
    
    // 📄 Article Details Page Placements (12 sections)
    'article-top', 'article-bottom', 'article-related', 'article-sidebar-left', 'article-sidebar-right', 
    'article-details-page', 'article-details-sidebar', 'article-inline', 'article-comments-top', 
    'article-comments-bottom', 'article-social-share', 'article-author-bio',
    
    // 🏷️ Category Page Placements (6 sections)
    'category-header', 'category-top', 'category-middle', 'category-bottom', 'category-sidebar', 
    'category-pagination',
    
    // 🔍 Search Results Placements (4 sections)
    'search-results-top', 'search-results-bottom', 'search-results-sidebar', 'search-no-results',
    
    // 📱 Mobile-Specific Placements (3 sections)
    'mobile-sticky-bottom', 'mobile-interstitial', 'mobile-notification',
    
    // 🎥 Video/Media Placements (6 sections)
    'video-player-top', 'video-player-bottom', 'video-player-sidebar',
    'gallery-top', 'gallery-bottom', 'gallery-interstitial',
    
    // 📧 Newsletter/Subscription Placements (3 sections)
    'newsletter-signup', 'subscription-popup', 'subscription-banner',
    
    // ⚠️ Error Page Placements (3 sections)
    'error-404', 'error-500', 'error-maintenance',
    
    // ⏳ Loading/Transition Placements (3 sections)
    'loading-screen', 'page-transition', 'skeleton-loading',
    
    // 📍 Header/Footer Placements (8 sections)
    'header-logo-area', 'below-header', 'header-top-banner', 'header-announcement',
    'footer', 'footer-top', 'footer-middle', 'footer-bottom', 'footer-newsletter',
    
    // 📊 Sidebar Placements (9 sections)
    'sidebar-left', 'sidebar-right', 'sidebar-must-read', 'sidebar-popular', 'sidebar-trending',
    'sidebar-category-list', 'sidebar-tag-cloud', 'sidebar-about', 'sidebar-contact',
    
    // 📝 Special Content Placements (4 sections)
    'content-break', 'content-interstitial', 'content-highlight', 'content-summary',
    
    // 🔄 Auto Injection Placements (2 sections)
    'auto-inject-5', 'auto-inject-10',
    
    // 🖼️ Media & Image Placements (4 sections)
    'image-gallery', 'post-image-overlay', 'post-content-middle', 'post-content-bottom',
    
    // 📰 Advanced Content Placements (3 sections)
    'related-posts-between', 'must-read-between', 'category-listing'
  ]).optional(),
  placementSize: z.enum(['small', 'medium', 'large', 'full-width']).optional(),
  targetArticleId: z.string().optional().or(z.literal('')),
  targetCategory: z.string().optional().or(z.literal('')),
  
  // New advanced fields
  adType: z.enum(['html', 'javascript', 'image-link', 'banner', 'popup']).default('html'),
  autoInjectFrequency: z.coerce.number().min(1).max(20).optional(),
  injectPosition: z.enum(['before', 'after', 'between']).default('between'),
  targetPages: z.array(z.string()).default([]),
  deviceTargeting: z.enum(['all', 'mobile', 'desktop', 'tablet']).default('all'),
  timeTargeting: z.object({
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    daysOfWeek: z.array(z.number()).default([])
  }).optional(),
  clickTracking: z.boolean().default(false),
  impressionTracking: z.boolean().default(false),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
});

export type GadgetFormData = z.infer<typeof gadgetFormSchema>;

interface GadgetFormProps {
  gadget?: Gadget | null;
  onSubmit: (data: GadgetFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  availableSections: LayoutSection[];
}

export default function GadgetForm({ gadget, onSubmit, onCancel, isSubmitting, availableSections: sections }: GadgetFormProps) {
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  
  const form = useForm<GadgetFormData>({
    resolver: zodResolver(gadgetFormSchema),
         defaultValues: {
       section: gadget?.section || 'homepage-top',
       title: gadget?.title || "",
       content: gadget?.content || "",
       isActive: gadget?.isActive === undefined ? true : gadget.isActive,
       order: gadget?.order || 0,
       unifiedPlacement: gadget?.unifiedPlacement || undefined,
       placementSize: gadget?.placementSize || undefined,
       targetArticleId: gadget?.targetArticleId || "",
       targetCategory: gadget?.targetCategory || "",
       
       // New advanced fields
       adType: gadget?.adType || 'html',
       autoInjectFrequency: gadget?.autoInjectFrequency || undefined,
       injectPosition: gadget?.injectPosition || 'between',
       targetPages: gadget?.targetPages || [],
       deviceTargeting: gadget?.deviceTargeting || 'all',
       timeTargeting: gadget?.timeTargeting || { daysOfWeek: [] },
       clickTracking: gadget?.clickTracking || false,
       impressionTracking: gadget?.impressionTracking || false,
       priority: gadget?.priority || 'medium',
     },
  });

  // Auto-set section when unified placement changes
  const selectedUnifiedPlacement = form.watch('unifiedPlacement');
  
  useEffect(() => {
    if (selectedUnifiedPlacement && placementToSectionMap[selectedUnifiedPlacement]) {
      const mappedSection = placementToSectionMap[selectedUnifiedPlacement];
      if (sections.includes(mappedSection)) {
        form.setValue('section', mappedSection);
      }
    }
  }, [selectedUnifiedPlacement, form, sections]);

  // Auto-set placement size when unified placement changes
  useEffect(() => {
    if (selectedUnifiedPlacement) {
      const placementConfig = getPlacementConfig(selectedUnifiedPlacement);
      if (placementConfig) {
        form.setValue('placementSize', placementConfig.size);
      }
    }
  }, [selectedUnifiedPlacement, form]);

  const handleSubmit = (data: GadgetFormData) => {
    // Ensure section is set based on unified placement
    if (data.unifiedPlacement && placementToSectionMap[data.unifiedPlacement]) {
      data.section = placementToSectionMap[data.unifiedPlacement];
    }
    onSubmit(data);
  };

  // Get placement size badge with color coding
  const getPlacementSizeBadge = (size: PlacementSize) => {
    const sizeColors = {
      'small': 'bg-gray-100 text-gray-700 border-gray-200',
      'medium': 'bg-blue-100 text-blue-700 border-blue-200',
      'large': 'bg-green-100 text-green-700 border-green-200',
      'full-width': 'bg-purple-100 text-purple-700 border-purple-200'
    };
    
    return (
      <Badge variant="outline" className={`${sizeColors[size] || 'bg-gray-100 text-gray-700'} text-xs font-medium`}>
        {size}
      </Badge>
    );
  };

  // Get placement category icon
  const getPlacementIcon = (placement: string) => {
    if (placement.startsWith('homepage-')) return <Monitor className="h-4 w-4" />;
    if (placement.startsWith('article-')) return <FileText className="h-4 w-4" />;
    if (placement.includes('sidebar')) return <Settings className="h-4 w-4" />;
    if (placement.includes('header') || placement.includes('footer')) return <Target className="h-4 w-4" />;
    if (placement.includes('auto-inject')) return <Zap className="h-4 w-4" />;
    if (placement.includes('image') || placement.includes('gallery')) return <Eye className="h-4 w-4" />;
    if (placement.includes('content')) return <FileText className="h-4 w-4" />;
    if (placement.includes('related') || placement.includes('must-read')) return <Settings className="h-4 w-4" />;
    return <Zap className="h-4 w-4" />;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-2xl font-bold text-gray-900">
              <Megaphone className="h-8 w-8 text-blue-600" />
              {gadget ? 'Edit Advertisement' : 'Add New Advertisement'}
            </div>
            <p className="text-gray-600">
              {gadget ? 'Update your advertisement settings and content' : 'Create a new advertisement for your website'}
            </p>
          </div>

          {/* Main Form */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column - Main Settings */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Placement Selection */}
              <Card className="border-blue-200 bg-blue-50/30">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2 text-blue-800">
                    <Target className="h-5 w-5" />
                    Ad Placement
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="unifiedPlacement"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Where will this ad appear?</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12 text-base">
                              <SelectValue placeholder="Select where you want this ad to appear" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-[600px] overflow-y-auto">
                            {/* 🏠 Homepage Placements (12 sections) */}
                            <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground bg-muted/50 rounded">
                              🏠 Homepage Placements (12 sections)
                            </div>
                            <SelectItem value="homepage-hero">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  {getPlacementIcon('homepage-hero')}
                                  <span>Hero Section - Above main hero section</span>
                                </div>
                                {getPlacementSizeBadge('large')}
                              </div>
                            </SelectItem>
                            <SelectItem value="homepage-top">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  {getPlacementIcon('homepage-top')}
                                  <span>Top - At the very top of homepage</span>
                                </div>
                                {getPlacementSizeBadge('full-width')}
                              </div>
                            </SelectItem>
                            <SelectItem value="homepage-latest-posts">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  {getPlacementIcon('homepage-latest-posts')}
                                  <span>Latest Posts - Between latest posts section</span>
                                </div>
                                {getPlacementSizeBadge('medium')}
                              </div>
                            </SelectItem>
                            <SelectItem value="homepage-more-headlines">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  {getPlacementIcon('homepage-more-headlines')}
                                  <span>More Headlines - Between more headlines section</span>
                                </div>
                                {getPlacementSizeBadge('small')}
                              </div>
                            </SelectItem>
                            <SelectItem value="homepage-content-bottom">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  {getPlacementIcon('homepage-content-bottom')}
                                  <span>Content Bottom - Below main content area</span>
                                </div>
                                {getPlacementSizeBadge('full-width')}
                              </div>
                            </SelectItem>
                            <SelectItem value="homepage-article-interstitial">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  {getPlacementIcon('homepage-article-interstitial')}
                                  <span>Article Interstitial - Between article blocks</span>
                                </div>
                                {getPlacementSizeBadge('medium')}
                              </div>
                            </SelectItem>
                            <SelectItem value="homepage-sidebar-top">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  {getPlacementIcon('homepage-sidebar-top')}
                                  <span>Sidebar Top - Top of homepage sidebar</span>
                                </div>
                                {getPlacementSizeBadge('small')}
                              </div>
                            </SelectItem>
                            <SelectItem value="homepage-sidebar-middle">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  {getPlacementIcon('homepage-sidebar-middle')}
                                  <span>Sidebar Middle - Middle of homepage sidebar</span>
                                </div>
                                {getPlacementSizeBadge('small')}
                              </div>
                            </SelectItem>
                            <SelectItem value="homepage-sidebar-bottom">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  {getPlacementIcon('homepage-sidebar-bottom')}
                                  <span>Sidebar Bottom - Bottom of homepage sidebar</span>
                                </div>
                                {getPlacementSizeBadge('small')}
                              </div>
                            </SelectItem>
                            <SelectItem value="homepage-category-banner">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  {getPlacementIcon('homepage-category-banner')}
                                  <span>Category Banner - Category-specific banner area</span>
                                </div>
                                {getPlacementSizeBadge('medium')}
                              </div>
                            </SelectItem>
                            <SelectItem value="homepage-breaking-news">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  {getPlacementIcon('homepage-breaking-news')}
                                  <span>Breaking News - Breaking news ticker area</span>
                                </div>
                                {getPlacementSizeBadge('medium')}
                              </div>
                            </SelectItem>
                            <SelectItem value="homepage-sidebar-must-read">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  {getPlacementIcon('homepage-sidebar-must-read')}
                                  <span>Sidebar Must Read - Must read section in sidebar</span>
                                </div>
                                {getPlacementSizeBadge('small')}
                              </div>
                            </SelectItem>

                            {/* 📄 Article Details Page Placements (12 sections) */}
                            <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground bg-muted/50 rounded mt-2">
                              📄 Article Details Page Placements (12 sections)
                            </div>
                            <SelectItem value="article-top">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  {getPlacementIcon('article-top')}
                                  <span>Top - Above article content</span>
                                </div>
                                {getPlacementSizeBadge('medium')}
                              </div>
                            </SelectItem>
                            <SelectItem value="article-bottom">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  {getPlacementIcon('article-bottom')}
                                  <span>Bottom - Below article content</span>
                                </div>
                                {getPlacementSizeBadge('medium')}
                              </div>
                            </SelectItem>
                            <SelectItem value="article-related">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  {getPlacementIcon('article-related')}
                                  <span>Related - Between related articles</span>
                                </div>
                                {getPlacementSizeBadge('medium')}
                              </div>
                            </SelectItem>
                            <SelectItem value="article-sidebar-left">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  {getPlacementIcon('article-sidebar-left')}
                                  <span>Sidebar Left - Left sidebar of article</span>
                                </div>
                                {getPlacementSizeBadge('small')}
                              </div>
                            </SelectItem>
                            <SelectItem value="article-sidebar-right">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  {getPlacementIcon('article-sidebar-right')}
                                  <span>Sidebar Right - Right sidebar of article</span>
                                </div>
                                {getPlacementSizeBadge('small')}
                              </div>
                            </SelectItem>
                            <SelectItem value="article-details-page">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  {getPlacementIcon('article-details-page')}
                                  <span>Details Page - Main article content area</span>
                                </div>
                                {getPlacementSizeBadge('medium')}
                              </div>
                            </SelectItem>
                            <SelectItem value="article-details-sidebar">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  {getPlacementIcon('article-details-sidebar')}
                                  <span>Details Sidebar - Article details sidebar</span>
                                </div>
                                {getPlacementSizeBadge('small')}
                              </div>
                            </SelectItem>
                            <SelectItem value="article-inline">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  {getPlacementIcon('article-inline')}
                                  <span>Inline - Inline within article text</span>
                                </div>
                                {getPlacementSizeBadge('small')}
                              </div>
                            </SelectItem>
                            <SelectItem value="article-comments-top">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  {getPlacementIcon('article-comments-top')}
                                  <span>Comments Top - Above comments section</span>
                                </div>
                                {getPlacementSizeBadge('medium')}
                              </div>
                            </SelectItem>
                            <SelectItem value="article-comments-bottom">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  {getPlacementIcon('article-comments-bottom')}
                                  <span>Comments Bottom - Below comments section</span>
                                </div>
                                {getPlacementSizeBadge('medium')}
                              </div>
                            </SelectItem>
                            <SelectItem value="article-social-share">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  {getPlacementIcon('article-social-share')}
                                  <span>Social Share - Social sharing buttons area</span>
                                </div>
                                {getPlacementSizeBadge('small')}
                              </div>
                            </SelectItem>
                            <SelectItem value="article-author-bio">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  {getPlacementIcon('article-author-bio')}
                                  <span>Author Bio - Author biography section</span>
                                </div>
                                {getPlacementSizeBadge('small')}
                              </div>
                            </SelectItem>
                            <SelectItem value="footer">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  {getPlacementIcon('footer')}
                                  <span>Footer Area</span>
                                </div>
                                {getPlacementSizeBadge('medium')}
                              </div>
                            </SelectItem>
                            
                            {/* 🏷️ Category Page Placements (6 sections) */}
                             <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground bg-muted/50 rounded mt-2">
                              🏷️ Category Page Placements (6 sections)
                             </div>
                            <SelectItem value="category-header">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  {getPlacementIcon('category-header')}
                                  <span>Header - Category page header area</span>
                                </div>
                                {getPlacementSizeBadge('medium')}
                              </div>
                            </SelectItem>
                            <SelectItem value="category-top">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  {getPlacementIcon('category-top')}
                                  <span>Top - Top of category listing</span>
                                </div>
                                {getPlacementSizeBadge('medium')}
                              </div>
                            </SelectItem>
                            <SelectItem value="category-middle">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  {getPlacementIcon('category-middle')}
                                  <span>Middle - Middle of category posts</span>
                                </div>
                                {getPlacementSizeBadge('medium')}
                              </div>
                            </SelectItem>
                            <SelectItem value="category-bottom">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  {getPlacementIcon('category-bottom')}
                                  <span>Bottom - Bottom of category listing</span>
                                </div>
                                {getPlacementSizeBadge('medium')}
                              </div>
                            </SelectItem>
                            <SelectItem value="category-sidebar">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  {getPlacementIcon('category-sidebar')}
                                  <span>Sidebar - Category page sidebar</span>
                                </div>
                                {getPlacementSizeBadge('small')}
                              </div>
                            </SelectItem>
                            <SelectItem value="category-pagination">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  {getPlacementIcon('category-pagination')}
                                  <span>Pagination - Above pagination controls</span>
                                </div>
                                {getPlacementSizeBadge('small')}
                              </div>
                            </SelectItem>

                            {/* 🔍 Search Results Placements (4 sections) */}
                             <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground bg-muted/50 rounded mt-2">
                              🔍 Search Results Placements (4 sections)
                             </div>
                            <SelectItem value="search-results-top">
                               <div className="flex items-center justify-between w-full">
                                 <div className="flex items-center gap-3">
                                  {getPlacementIcon('search-results-top')}
                                  <span>Top - Above search results</span>
                                 </div>
                                 {getPlacementSizeBadge('medium')}
                               </div>
                             </SelectItem>
                            <SelectItem value="search-results-bottom">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  {getPlacementIcon('search-results-bottom')}
                                  <span>Bottom - Below search results</span>
                                </div>
                                {getPlacementSizeBadge('medium')}
                              </div>
                            </SelectItem>
                            <SelectItem value="search-results-sidebar">
                               <div className="flex items-center justify-between w-full">
                                 <div className="flex items-center gap-3">
                                  {getPlacementIcon('search-results-sidebar')}
                                  <span>Sidebar - Search results sidebar</span>
                                 </div>
                                 {getPlacementSizeBadge('small')}
                               </div>
                             </SelectItem>
                            <SelectItem value="search-no-results">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  {getPlacementIcon('search-no-results')}
                                  <span>No Results - When no results found</span>
                                </div>
                                {getPlacementSizeBadge('medium')}
                              </div>
                            </SelectItem>

                            {/* 📱 Mobile-Specific Placements (3 sections) */}
                            <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground bg-muted/50 rounded mt-2">
                              📱 Mobile-Specific Placements (3 sections)
                            </div>
                            <SelectItem value="mobile-sticky-bottom">
                               <div className="flex items-center justify-between w-full">
                                 <div className="flex items-center gap-3">
                                  {getPlacementIcon('mobile-sticky-bottom')}
                                  <span>Sticky Bottom - Sticky bottom on mobile</span>
                                 </div>
                                 {getPlacementSizeBadge('medium')}
                               </div>
                             </SelectItem>
                            <SelectItem value="mobile-interstitial">
                               <div className="flex items-center justify-between w-full">
                                 <div className="flex items-center gap-3">
                                  {getPlacementIcon('mobile-interstitial')}
                                  <span>Interstitial - Mobile interstitial ads</span>
                                 </div>
                                 {getPlacementSizeBadge('medium')}
                               </div>
                             </SelectItem>
                            <SelectItem value="mobile-notification">
                               <div className="flex items-center justify-between w-full">
                                 <div className="flex items-center gap-3">
                                  {getPlacementIcon('mobile-notification')}
                                  <span>Notification - Mobile notification area</span>
                                </div>
                                {getPlacementSizeBadge('small')}
                              </div>
                            </SelectItem>

                            {/* 🎥 Video/Media Placements (6 sections) */}
                            <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground bg-muted/50 rounded mt-2">
                              🎥 Video/Media Placements (6 sections)
                            </div>
                            <SelectItem value="video-player-top">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  {getPlacementIcon('video-player-top')}
                                  <span>Top - Above video player</span>
                                 </div>
                                 {getPlacementSizeBadge('medium')}
                               </div>
                             </SelectItem>
                            <SelectItem value="video-player-bottom">
                               <div className="flex items-center justify-between w-full">
                                 <div className="flex items-center gap-3">
                                  {getPlacementIcon('video-player-bottom')}
                                  <span>Bottom - Below video player</span>
                                </div>
                                {getPlacementSizeBadge('medium')}
                              </div>
                            </SelectItem>
                            <SelectItem value="video-player-sidebar">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  {getPlacementIcon('video-player-sidebar')}
                                  <span>Sidebar - Video player sidebar</span>
                                </div>
                                {getPlacementSizeBadge('small')}
                              </div>
                            </SelectItem>
                            <SelectItem value="gallery-top">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  {getPlacementIcon('gallery-top')}
                                  <span>Top - Above image gallery</span>
                                </div>
                                {getPlacementSizeBadge('medium')}
                              </div>
                            </SelectItem>
                            <SelectItem value="gallery-bottom">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  {getPlacementIcon('gallery-bottom')}
                                  <span>Bottom - Below image gallery</span>
                                </div>
                                {getPlacementSizeBadge('medium')}
                              </div>
                            </SelectItem>
                            <SelectItem value="gallery-interstitial">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  {getPlacementIcon('gallery-interstitial')}
                                  <span>Interstitial - Between gallery images</span>
                                 </div>
                                 {getPlacementSizeBadge('small')}
                               </div>
                             </SelectItem>

                            {/* 📧 Newsletter/Subscription Placements (3 sections) */}
                            <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground bg-muted/50 rounded mt-2">
                              📧 Newsletter/Subscription Placements (3 sections)
                            </div>
                            <SelectItem value="newsletter-signup">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  {getPlacementIcon('newsletter-signup')}
                                  <span>Signup - Newsletter signup form</span>
                                </div>
                                {getPlacementSizeBadge('medium')}
                              </div>
                            </SelectItem>
                            <SelectItem value="subscription-popup">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  {getPlacementIcon('subscription-popup')}
                                  <span>Popup - Subscription popup trigger</span>
                                </div>
                                {getPlacementSizeBadge('small')}
                              </div>
                            </SelectItem>
                            <SelectItem value="subscription-banner">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  {getPlacementIcon('subscription-banner')}
                                  <span>Banner - Subscription banner</span>
                                </div>
                                {getPlacementSizeBadge('medium')}
                              </div>
                            </SelectItem>

                            {/* ⚠️ Error Page Placements (3 sections) */}
                            <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground bg-muted/50 rounded mt-2">
                              ⚠️ Error Page Placements (3 sections)
                            </div>
                            <SelectItem value="error-404">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  {getPlacementIcon('error-404')}
                                  <span>404 - 404 error page</span>
                                </div>
                                {getPlacementSizeBadge('medium')}
                              </div>
                            </SelectItem>
                            <SelectItem value="error-500">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  {getPlacementIcon('error-500')}
                                  <span>500 - 500 error page</span>
                                </div>
                                {getPlacementSizeBadge('medium')}
                              </div>
                            </SelectItem>
                            <SelectItem value="error-maintenance">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  {getPlacementIcon('error-maintenance')}
                                  <span>Maintenance - Maintenance page</span>
                                </div>
                                {getPlacementSizeBadge('medium')}
                              </div>
                            </SelectItem>

                            {/* ⏳ Loading/Transition Placements (3 sections) */}
                            <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground bg-muted/50 rounded mt-2">
                              ⏳ Loading/Transition Placements (3 sections)
                            </div>
                            <SelectItem value="loading-screen">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  {getPlacementIcon('loading-screen')}
                                  <span>Loading Screen - Loading screen overlay</span>
                                </div>
                                {getPlacementSizeBadge('full-width')}
                              </div>
                            </SelectItem>
                            <SelectItem value="page-transition">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  {getPlacementIcon('page-transition')}
                                  <span>Page Transition - Page transition area</span>
                                </div>
                                {getPlacementSizeBadge('medium')}
                              </div>
                            </SelectItem>
                            <SelectItem value="skeleton-loading">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  {getPlacementIcon('skeleton-loading')}
                                  <span>Skeleton Loading - Skeleton loading area</span>
                                </div>
                                {getPlacementSizeBadge('medium')}
                              </div>
                            </SelectItem>

                            {/* 📍 Header/Footer Placements (8 sections) */}
                            <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground bg-muted/50 rounded mt-2">
                              📍 Header/Footer Placements (8 sections)
                            </div>
                            <SelectItem value="header-logo-area">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  {getPlacementIcon('header-logo-area')}
                                  <span>Logo Area - Logo area in header</span>
                                </div>
                                {getPlacementSizeBadge('small')}
                              </div>
                            </SelectItem>
                            <SelectItem value="below-header">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  {getPlacementIcon('below-header')}
                                  <span>Below Header - Below header navigation</span>
                                </div>
                                {getPlacementSizeBadge('full-width')}
                              </div>
                            </SelectItem>
                            <SelectItem value="header-top-banner">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  {getPlacementIcon('header-top-banner')}
                                  <span>Top Banner - Top banner above header</span>
                                </div>
                                {getPlacementSizeBadge('full-width')}
                              </div>
                            </SelectItem>
                            <SelectItem value="header-announcement">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  {getPlacementIcon('header-announcement')}
                                  <span>Announcement - Announcement bar area</span>
                                </div>
                                {getPlacementSizeBadge('full-width')}
                              </div>
                            </SelectItem>
                            <SelectItem value="footer-top">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  {getPlacementIcon('footer-top')}
                                  <span>Footer Top - Top of footer area</span>
                                </div>
                                {getPlacementSizeBadge('medium')}
                              </div>
                            </SelectItem>
                            <SelectItem value="footer-middle">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  {getPlacementIcon('footer-middle')}
                                  <span>Footer Middle - Middle of footer content</span>
                                </div>
                                {getPlacementSizeBadge('medium')}
                              </div>
                            </SelectItem>
                            <SelectItem value="footer-bottom">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  {getPlacementIcon('footer-bottom')}
                                  <span>Footer Bottom - Bottom of footer area</span>
                                </div>
                                {getPlacementSizeBadge('medium')}
                              </div>
                            </SelectItem>
                            <SelectItem value="footer-newsletter">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  {getPlacementIcon('footer-newsletter')}
                                  <span>Footer Newsletter - Newsletter signup area</span>
                                </div>
                                {getPlacementSizeBadge('medium')}
                              </div>
                            </SelectItem>

                            {/* 📊 Sidebar Placements (9 sections) */}
                            <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground bg-muted/50 rounded mt-2">
                              📊 Sidebar Placements (9 sections)
                            </div>
                            <SelectItem value="sidebar-left">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  {getPlacementIcon('sidebar-left')}
                                  <span>Left Sidebar - Left sidebar general</span>
                                </div>
                                {getPlacementSizeBadge('small')}
                              </div>
                            </SelectItem>
                            <SelectItem value="sidebar-right">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  {getPlacementIcon('sidebar-right')}
                                  <span>Right Sidebar - Right sidebar general</span>
                                </div>
                                {getPlacementSizeBadge('small')}
                              </div>
                            </SelectItem>
                            <SelectItem value="sidebar-must-read">
                               <div className="flex items-center justify-between w-full">
                                 <div className="flex items-center gap-3">
                                  {getPlacementIcon('sidebar-must-read')}
                                  <span>Must Read - Must-read section</span>
                                </div>
                                {getPlacementSizeBadge('small')}
                              </div>
                            </SelectItem>
                            <SelectItem value="sidebar-popular">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  {getPlacementIcon('sidebar-popular')}
                                  <span>Popular - Popular posts section</span>
                                </div>
                                {getPlacementSizeBadge('small')}
                              </div>
                            </SelectItem>
                            <SelectItem value="sidebar-trending">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  {getPlacementIcon('sidebar-trending')}
                                  <span>Trending - Trending topics section</span>
                                </div>
                                {getPlacementSizeBadge('small')}
                              </div>
                            </SelectItem>
                            <SelectItem value="sidebar-category-list">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  {getPlacementIcon('sidebar-category-list')}
                                  <span>Category List - Category listing section</span>
                                </div>
                                {getPlacementSizeBadge('small')}
                              </div>
                            </SelectItem>
                            <SelectItem value="sidebar-tag-cloud">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  {getPlacementIcon('sidebar-tag-cloud')}
                                  <span>Tag Cloud - Tag cloud section</span>
                                </div>
                                {getPlacementSizeBadge('small')}
                              </div>
                            </SelectItem>
                            <SelectItem value="sidebar-about">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  {getPlacementIcon('sidebar-about')}
                                  <span>About - About section</span>
                                </div>
                                {getPlacementSizeBadge('small')}
                              </div>
                            </SelectItem>
                            <SelectItem value="sidebar-contact">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  {getPlacementIcon('sidebar-contact')}
                                  <span>Contact - Contact information</span>
                                 </div>
                                 {getPlacementSizeBadge('small')}
                               </div>
                             </SelectItem>
                             
                            {/* 📝 Special Content Placements (4 sections) */}
                             <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground bg-muted/50 rounded mt-2">
                              📝 Special Content Placements (4 sections)
                            </div>
                            <SelectItem value="content-break">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  {getPlacementIcon('content-break')}
                                  <span>Content Break - Content break points</span>
                                </div>
                                {getPlacementSizeBadge('small')}
                              </div>
                            </SelectItem>
                            <SelectItem value="content-interstitial">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  {getPlacementIcon('content-interstitial')}
                                  <span>Content Interstitial - Between content blocks</span>
                                </div>
                                {getPlacementSizeBadge('medium')}
                              </div>
                            </SelectItem>
                            <SelectItem value="content-highlight">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  {getPlacementIcon('content-highlight')}
                                  <span>Content Highlight - Highlighted content area</span>
                                </div>
                                {getPlacementSizeBadge('medium')}
                              </div>
                            </SelectItem>
                            <SelectItem value="content-summary">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  {getPlacementIcon('content-summary')}
                                  <span>Content Summary - Content summary section</span>
                                </div>
                                {getPlacementSizeBadge('small')}
                              </div>
                            </SelectItem>

                            {/* 🔄 Auto Injection Placements (2 sections) */}
                            <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground bg-muted/50 rounded mt-2">
                              🔄 Auto Injection Placements (2 sections)
                             </div>
                             <SelectItem value="auto-inject-5">
                               <div className="flex items-center justify-between w-full">
                                 <div className="flex items-center gap-3">
                                   {getPlacementIcon('auto-inject-5')}
                                  <span>Every 5 Posts - Every 5 posts automatically</span>
                                 </div>
                                 {getPlacementSizeBadge('medium')}
                               </div>
                             </SelectItem>
                             <SelectItem value="auto-inject-10">
                               <div className="flex items-center justify-between w-full">
                                 <div className="flex items-center gap-3">
                                   {getPlacementIcon('auto-inject-10')}
                                  <span>Every 10 Posts - Every 10 posts automatically</span>
                                 </div>
                                 {getPlacementSizeBadge('medium')}
                               </div>
                             </SelectItem>
                             
                            {/* 🖼️ Media & Image Placements (4 sections) */}
                             <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground bg-muted/50 rounded mt-2">
                              🖼️ Media & Image Placements (4 sections)
                             </div>
                             <SelectItem value="image-gallery">
                               <div className="flex items-center justify-between w-full">
                                 <div className="flex items-center gap-3">
                                   {getPlacementIcon('image-gallery')}
                                  <span>Image Gallery - Image gallery overlay</span>
                                 </div>
                                 {getPlacementSizeBadge('small')}
                               </div>
                             </SelectItem>
                             <SelectItem value="post-image-overlay">
                               <div className="flex items-center justify-between w-full">
                                 <div className="flex items-center gap-3">
                                   {getPlacementIcon('post-image-overlay')}
                                  <span>Post Image Overlay - Post image overlay</span>
                                 </div>
                                 {getPlacementSizeBadge('small')}
                               </div>
                             </SelectItem>
                            <SelectItem value="post-content-middle">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  {getPlacementIcon('post-content-middle')}
                                  <span>Post Content Middle - Middle of post content</span>
                                </div>
                                {getPlacementSizeBadge('medium')}
                              </div>
                            </SelectItem>
                            <SelectItem value="post-content-bottom">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  {getPlacementIcon('post-content-bottom')}
                                  <span>Post Content Bottom - Bottom of post content</span>
                                </div>
                                {getPlacementSizeBadge('medium')}
                              </div>
                            </SelectItem>

                            {/* 📰 Advanced Content Placements (3 sections) */}
                            <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground bg-muted/50 rounded mt-2">
                              📰 Advanced Content Placements (3 sections)
                            </div>
                            <SelectItem value="related-posts-between">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  {getPlacementIcon('related-posts-between')}
                                  <span>Related Posts Between - Between related posts</span>
                                </div>
                                {getPlacementSizeBadge('medium')}
                              </div>
                            </SelectItem>
                            <SelectItem value="must-read-between">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  {getPlacementIcon('must-read-between')}
                                  <span>Must Read Between - Between must-read post sections</span>
                                </div>
                                {getPlacementSizeBadge('small')}
                              </div>
                            </SelectItem>
                            <SelectItem value="category-listing">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  {getPlacementIcon('category-listing')}
                                  <span>Category Listing - Category page listing</span>
                                </div>
                                {getPlacementSizeBadge('medium')}
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription className="text-sm">
                           Choose from 80+ placement sections across your website. Each placement is optimized for specific content areas and automatically sets the appropriate ad size. The placement determines both location and size for optimal performance.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                                     {/* Hidden section field - automatically set based on unified placement */}
                   <FormField
                     control={form.control}
                     name="section"
                     render={({ field }) => (
                       <FormItem className="hidden">
                         <FormControl>
                           <Input {...field} type="hidden" />
                         </FormControl>
                       </FormItem>
                     )}
                   />
                   
                   {/* Ad Type Selection */}
                   <FormField
                     control={form.control}
                     name="adType"
                     render={({ field }) => (
                       <FormItem>
                         <FormLabel className="text-base font-semibold">Ad Type</FormLabel>
                         <Select onValueChange={field.onChange} value={field.value}>
                           <FormControl>
                             <SelectTrigger className="h-11">
                               <SelectValue placeholder="Select ad type" />
                             </SelectTrigger>
                           </FormControl>
                           <SelectContent>
                             <SelectItem value="html">
                               <div className="flex items-center gap-2">
                                 <FileText className="h-4 w-4" />
                                 HTML Advertisement
                               </div>
                             </SelectItem>
                             <SelectItem value="javascript">
                               <div className="flex items-center gap-2">
                                 <Zap className="h-4 w-4" />
                                 JavaScript Code
                               </div>
                             </SelectItem>
                             <SelectItem value="image-link">
                               <div className="flex items-center gap-2">
                                 <Target className="h-4 w-4" />
                                 Image with Direct Link
                               </div>
                             </SelectItem>
                             <SelectItem value="banner">
                               <div className="flex items-center gap-2">
                                 <Monitor className="h-4 w-4" />
                                 Banner Advertisement
                               </div>
                             </SelectItem>
                             <SelectItem value="popup">
                               <div className="flex items-center gap-2">
                                 <Eye className="h-4 w-4" />
                                 Popup Advertisement
                               </div>
                             </SelectItem>
                           </SelectContent>
                         </Select>
                         <FormDescription>
                           Choose the type of advertisement you want to create.
                         </FormDescription>
                         <FormMessage />
                       </FormItem>
                     )}
                   />
                   
                   {/* Auto Injection Settings */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <FormField
                       control={form.control}
                       name="autoInjectFrequency"
                       render={({ field }) => (
                         <FormItem>
                           <FormLabel className="text-base font-semibold text-black">Auto Inject Every N Posts</FormLabel>
                           <FormControl>
                             <Input 
                               type="number" 
                               placeholder="5, 10, etc." 
                               {...field} 
                               onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                               className="h-11 border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                             />
                           </FormControl>
                           <FormDescription className="text-black">
                             Automatically inject this ad every N posts (leave empty for manual placement)
                           </FormDescription>
                           <FormMessage />
                         </FormItem>
                       )}
                     />
                     
                     <FormField
                       control={form.control}
                       name="injectPosition"
                       render={({ field }) => (
                         <FormItem>
                           <FormLabel className="text-base font-semibold">Injection Position</FormLabel>
                           <Select onValueChange={field.onChange} value={field.value}>
                             <FormControl>
                               <SelectTrigger className="h-11">
                                 <SelectValue placeholder="Select position" />
                               </SelectTrigger>
                             </FormControl>
                             <SelectContent>
                               <SelectItem value="before">Before Posts</SelectItem>
                               <SelectItem value="after">After Posts</SelectItem>
                               <SelectItem value="between">Between Posts</SelectItem>
                             </SelectContent>
                           </Select>
                           <FormDescription>
                             Where to inject the ad relative to posts
                           </FormDescription>
                           <FormMessage />
                         </FormItem>
                       )}
                     />
                   </div>
                </CardContent>
              </Card>

              {/* Ad Content */}
              <Card className="border-green-200 bg-green-50/30">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2 text-green-800">
                    <FileText className="h-5 w-5" />
                    Ad Content
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold text-black">Ad Title (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter a title for this advertisement" 
                            {...field} 
                            className="h-11 border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          />
                        </FormControl>
                        <FormDescription className="text-black">Optional title for the advertisement.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold text-black">Ad Content</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter HTML, JavaScript, or other content for this advertisement" 
                            {...field} 
                            rows={10}
                            className="font-mono text-sm resize-none border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          />
                        </FormControl>
                        <FormDescription className="text-black">
                          Enter the HTML, JavaScript, or other content for this advertisement.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Advanced Settings */}
              <Card className="border-purple-200 bg-purple-50/30">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2 text-purple-800">
                    <Settings className="h-5 w-5" />
                    Advanced Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Advanced Mode</h4>
                      <p className="text-sm text-gray-600">Show additional configuration options</p>
                    </div>
                    <Switch
                      checked={isAdvancedMode}
                      onCheckedChange={setIsAdvancedMode}
                    />
                  </div>

                  {isAdvancedMode && (
                    <div className="space-y-4 pt-4 border-t border-purple-200">
                      <FormField
                        control={form.control}
                        name="placementSize"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Placement Size</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Size will be auto-selected based on placement" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="small">Small</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="large">Large</SelectItem>
                                <SelectItem value="full-width">Full Width</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              The size will be automatically set based on the unified placement selection.
                              You can override it here if needed.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="order"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-black">Display Order</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="0" 
                                {...field} 
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                className="h-11 border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                              />
                            </FormControl>
                            <FormDescription className="text-black">
                              Lower numbers appear first. Leave empty for default ordering.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="targetArticleId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-black">Target Article ID (Optional)</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter article ID for article-specific targeting" 
                                {...field} 
                                className="h-11 border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                              />
                            </FormControl>
                            <FormDescription className="text-black">
                              If you want this ad to appear only on specific articles, enter the article ID here.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                                             <FormField
                         control={form.control}
                         name="targetCategory"
                         render={({ field }) => (
                           <FormItem>
                             <FormLabel className="text-black">Target Category (Optional)</FormLabel>
                             <FormControl>
                               <Input 
                                 placeholder="Enter category for category-specific targeting" 
                                 {...field} 
                                 className="h-11 border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                               />
                             </FormControl>
                             <FormDescription className="text-black">
                               If you want this ad to appear only on articles of a specific category, enter the category here.
                             </FormDescription>
                             <FormMessage />
                           </FormItem>
                         )}
                       />
                       
                       {/* Priority and Tracking */}
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <FormField
                           control={form.control}
                           name="priority"
                           render={({ field }) => (
                             <FormItem>
                               <FormLabel>Ad Priority</FormLabel>
                               <Select onValueChange={field.onChange} value={field.value}>
                                 <FormControl>
                                   <SelectTrigger>
                                     <SelectValue placeholder="Select priority" />
                                   </SelectTrigger>
                                 </FormControl>
                                 <SelectContent>
                                   <SelectItem value="low">Low</SelectItem>
                                   <SelectItem value="medium">Medium</SelectItem>
                                   <SelectItem value="high">High</SelectItem>
                                   <SelectItem value="urgent">Urgent</SelectItem>
                                 </SelectContent>
                               </Select>
                               <FormDescription>
                                 Higher priority ads are shown first
                               </FormDescription>
                               <FormMessage />
                             </FormItem>
                           )}
                         />
                         
                         <FormField
                           control={form.control}
                           name="deviceTargeting"
                           render={({ field }) => (
                             <FormItem>
                               <FormLabel>Device Targeting</FormLabel>
                               <Select onValueChange={field.onChange} value={field.value}>
                                 <FormControl>
                                   <SelectTrigger>
                                     <SelectValue placeholder="Select devices" />
                                   </SelectTrigger>
                                 </FormControl>
                                 <SelectContent>
                                   <SelectItem value="all">All Devices</SelectItem>
                                   <SelectItem value="mobile">Mobile Only</SelectItem>
                                   <SelectItem value="desktop">Desktop Only</SelectItem>
                                   <SelectItem value="tablet">Tablet Only</SelectItem>
                                 </SelectContent>
                               </Select>
                               <FormDescription>
                                 Target specific device types
                               </FormDescription>
                               <FormMessage />
                             </FormItem>
                           )}
                         />
                       </div>
                       
                       {/* Tracking Options */}
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <FormField
                           control={form.control}
                           name="clickTracking"
                           render={({ field }) => (
                             <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 bg-white">
                               <div className="space-y-0.5">
                                 <FormLabel className="text-sm font-medium">Click Tracking</FormLabel>
                                 <FormDescription className="text-xs">
                                   Track ad clicks for analytics
                                 </FormDescription>
                               </div>
                               <FormControl>
                                 <Switch
                                   checked={field.value}
                                   onCheckedChange={field.onChange}
                                 />
                               </FormControl>
                             </FormItem>
                           )}
                         />
                         
                         <FormField
                           control={form.control}
                           name="impressionTracking"
                           render={({ field }) => (
                             <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 bg-white">
                               <div className="space-y-0.5">
                                 <FormLabel className="text-sm font-medium">Impression Tracking</FormLabel>
                                 <FormDescription className="text-xs">
                                   Track ad impressions for analytics
                                 </FormDescription>
                               </div>
                               <FormControl>
                                 <Switch
                                   checked={field.value}
                                   onCheckedChange={field.onChange}
                                 />
                               </FormControl>
                             </FormItem>
                           )}
                         />
                       </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Preview & Status */}
            <div className="space-y-6">
              
              {/* Placement Preview */}
              {selectedUnifiedPlacement && (
                <Card className="border-blue-200 bg-blue-50/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2 text-blue-800">
                      <Eye className="h-4 w-4" />
                      Placement Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-blue-700 space-y-2">
                    {(() => {
                      const placement = selectedUnifiedPlacement;
                      if (placement.startsWith('homepage-')) {
                        return (
                          <>
                            <p><strong>🏠 This ad will appear on:</strong> Homepage</p>
                            {placement === 'homepage-hero' && <p>• <strong>Hero Section:</strong> Large banner at the very top</p>}
                            {placement === 'homepage-latest-posts' && <p>• <strong>Latest Posts Area:</strong> Above the main article grid</p>}
                            {placement === 'homepage-more-headlines' && <p>• <strong>More Headlines:</strong> In the headlines section</p>}
                            {placement === 'homepage-sidebar-must-read' && <p>• <strong>Sidebar:</strong> In the "Must Read" section</p>}
                            {placement === 'homepage-article-interstitial' && <p>• <strong>Between Articles:</strong> Every 2-3 posts</p>}
                            {placement === 'homepage-content-bottom' && <p>• <strong>Bottom:</strong> At the end of homepage content</p>}
                          </>
                        );
                                             } else if (placement.startsWith('article-')) {
                         return (
                           <>
                             <p><strong>📰 This ad will appear on:</strong> Article/News Detail Pages</p>
                             {placement === 'article-top' && <p>• <strong>Top:</strong> Above the article content</p>}
                             {placement === 'article-bottom' && <p>• <strong>Bottom:</strong> Below the article content</p>}
                             {placement === 'article-inline' && <p>• <strong>Inline:</strong> Inside article content (use [AD_INLINE])</p>}
                             {placement === 'article-related' && <p>• <strong>Related Articles:</strong> Above related posts section</p>}
                             {placement === 'category-listing' && <p>• <strong>Category Page:</strong> In category listing pages</p>}
                             {placement === 'article-details-page' && <p>• <strong>Main Content:</strong> In the alternating posts/ads grid below article</p>}
                             {placement === 'article-details-sidebar' && <p>• <strong>Sidebar:</strong> In the sidebar article list</p>}
                             {placement === 'post-content-middle' && <p>• <strong>Content Middle:</strong> In the middle of post content</p>}
                             {placement === 'post-content-bottom' && <p>• <strong>Content Bottom:</strong> At the bottom of post content</p>}
                             {placement === 'related-posts-between' && <p>• <strong>Related Posts:</strong> Between related posts sections</p>}
                             {placement === 'must-read-between' && <p>• <strong>Must Read:</strong> Between must-read post sections</p>}
                             {placement === 'image-gallery' && <p>• <strong>Image Gallery:</strong> Overlay on image galleries</p>}
                             {placement === 'post-image-overlay' && <p>• <strong>Post Image:</strong> Overlay on post images</p>}
                             {placement === 'auto-inject-5' && <p>• <strong>Auto Inject:</strong> Every 5 posts automatically</p>}
                             {placement === 'auto-inject-10' && <p>• <strong>Auto Inject:</strong> Every 10 posts automatically</p>}
                             {placement.includes('sidebar') && <p>• <strong>Sidebar:</strong> In the left or right sidebar</p>}
                           </>
                         );
                      } else if (placement.includes('sidebar')) {
                        return (
                          <>
                            <p><strong>📍 This ad will appear on:</strong> Sidebar areas</p>
                            <p>• <strong>Location:</strong> {placement === 'sidebar-left' ? 'Left Sidebar' : 'Right Sidebar'}</p>
                            <p>• <strong>Pages:</strong> All pages with sidebars</p>
                          </>
                        );
                      } else if (placement.includes('header') || placement.includes('footer')) {
                        return (
                          <>
                            <p><strong>🎯 This ad will appear on:</strong> {placement.includes('header') ? 'Header area' : 'Footer area'}</p>
                            <p>• <strong>Location:</strong> {placement === 'header-logo-area' ? 'Header logo area' : placement === 'below-header' ? 'Below header' : 'Footer'}</p>
                            <p>• <strong>Pages:</strong> All pages</p>
                          </>
                        );
                      }
                      return null;
                    })()}
                  </CardContent>
                </Card>
              )}

              {/* Ad Status */}
              <Card className="border-orange-200 bg-orange-50/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2 text-orange-800">
                    <Zap className="h-4 w-4" />
                    Ad Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 bg-white">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm font-medium">Active Status</FormLabel>
                          <FormDescription className="text-xs">
                            Enable or disable this advertisement.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Quick Tips */}
              <Card className="border-gray-200 bg-gray-50/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2 text-gray-800">
                    💡 Quick Tips
                  </CardTitle>
                </CardHeader>
                                 <CardContent className="text-xs text-gray-600 space-y-2">
                   <p>• <strong>HTML Ads:</strong> Use standard HTML tags</p>
                   <p>• <strong>JavaScript:</strong> Include &lt;script&gt; tags</p>
                   <p>• <strong>Image Links:</strong> Use Adsterra direct links</p>
                   <p>• <strong>Auto Injection:</strong> Set frequency for automatic placement</p>
                   <p>• <strong>Device Targeting:</strong> Target specific devices</p>
                   <p>• <strong>Performance:</strong> Keep ads lightweight</p>
                 </CardContent>
              </Card>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onCancel} className="h-11 px-6">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="h-11 px-8">
              {isSubmitting ? "Saving..." : (gadget ? "Update Advertisement" : "Create Advertisement")}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
