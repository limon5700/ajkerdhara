"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { BarChart3, Info, Loader2, Youtube, Facebook, Link as LinkIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getSeoSettings, updateSeoSettings } from '@/lib/data'; 
import type { SeoSettings, CreateSeoSettingsData } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  FormDescription,
  FormLabel, 
} from "@/components/ui/form";


const seoFormSchema = z.object({
  siteTitle: z.string().min(3, "Site title must be at least 3 characters.").max(70, "Site title must be 70 characters or less.").optional().or(z.literal('')),
  metaDescription: z.string().min(10, "Meta description must be at least 10 characters.").max(160, "Meta description must be 160 characters or less.").optional().or(z.literal('')),
  metaKeywords: z.string().optional().or(z.literal('')), // Comma-separated string
  faviconUrl: z.string().url("Must be a valid URL, e.g., /favicon.ico or https://example.com/favicon.png").optional().or(z.literal('')),
  ogSiteName: z.string().optional().or(z.literal('')),
  ogLocale: z.string().regex(/^[a-z]{2}_[A-Z]{2}$/, "Must be in ll_CC format, e.g., en_US").optional().or(z.literal('')),
  ogType: z.string().optional().or(z.literal('')),
  twitterCard: z.enum(["summary", "summary_large_image", "app", "player"]).optional().or(z.literal('')),
  twitterSite: z.string().regex(/^@?(\w){1,15}$/, "Must be a valid Twitter handle, e.g., @username").optional().or(z.literal('')),
  twitterCreator: z.string().regex(/^@?(\w){1,15}$/, "Must be a valid Twitter handle, e.g., @username").optional().or(z.literal('')),
  // Footer social links
  footerYoutubeUrl: z.string().url("Must be a valid YouTube URL.").optional().or(z.literal('')),
  footerFacebookUrl: z.string().url("Must be a valid Facebook URL.").optional().or(z.literal('')),
  footerMoreLinksUrl: z.string().url("Must be a valid URL for 'More Links'.").optional().or(z.literal('')),
});

type SeoFormData = z.infer<typeof seoFormSchema>;

export default function SeoManagementPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<SeoFormData>({
    resolver: zodResolver(seoFormSchema),
    defaultValues: {
      siteTitle: '',
      metaDescription: '',
      metaKeywords: '',
      faviconUrl: '',
      ogSiteName: '',
      ogLocale: 'bn_BD', 
      ogType: 'website',
      twitterCard: 'summary_large_image',
      twitterSite: '',
      twitterCreator: '',
      footerYoutubeUrl: '',
      footerFacebookUrl: '',
      footerMoreLinksUrl: '',
    }
  });

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const currentSettings = await getSeoSettings();
        if (currentSettings) {
          form.reset({
            siteTitle: currentSettings.siteTitle || '',
            metaDescription: currentSettings.metaDescription || '',
            metaKeywords: (currentSettings.metaKeywords || []).join(', '),
            faviconUrl: currentSettings.faviconUrl || '',
            ogSiteName: currentSettings.ogSiteName || '',
            ogLocale: currentSettings.ogLocale || 'bn_BD',
            ogType: currentSettings.ogType || 'website',
            twitterCard: currentSettings.twitterCard as any || 'summary_large_image',
            twitterSite: currentSettings.twitterSite || '',
            twitterCreator: currentSettings.twitterCreator || '',
            footerYoutubeUrl: currentSettings.footerYoutubeUrl || '',
            footerFacebookUrl: currentSettings.footerFacebookUrl || '',
            footerMoreLinksUrl: currentSettings.footerMoreLinksUrl || '',
          });
        }
      } catch (error) {
        toast({ title: "Error", description: "Failed to load SEO settings.", variant: "destructive" });
        console.error("Error fetching SEO settings for form:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, [form, toast]);

  const onSubmit = async (data: SeoFormData) => {
    setIsSubmitting(true);
    try {
      const updateData: CreateSeoSettingsData = {
        ...data,
        metaKeywords: data.metaKeywords?.split(',').map(k => k.trim()).filter(k => k) || [],
      };
      const result = await updateSeoSettings(updateData);
      if (result) {
        toast({ title: "Success", description: "SEO settings updated successfully." });
        form.reset({ 
            ...data, 
            metaKeywords: (result.metaKeywords || []).join(', '), 
        });
      } else {
        toast({ title: "Error", description: "Failed to update SEO settings. No result returned.", variant: "destructive" });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({ title: "Error", description: `Failed to update SEO settings: ${errorMessage}`, variant: "destructive" });
      console.error("Error submitting SEO form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const errorExplanation = (
     <Card className="mb-6 border-yellow-400 bg-yellow-50">
        <CardHeader>
            <CardTitle className="text-lg text-yellow-800">Note on Console Errors & Page Display</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-yellow-700 space-y-2">
            <p>
                If you see errors in your browser's developer console related to <code>extensions.aitopia.ai</code> or similar domains not controlled by this application, these are likely caused by a browser extension you have installed (e.g., Aitopia). These errors are not part of Clypio and can usually be ignored or resolved by managing your browser extensions.
            </p>
            <p>
                If this SEO Management page, or other admin pages, appear blank or don't load correctly, and there are no errors in the console directly related to the application's files (e.g., <code>seo/page.tsx</code>, <code>lib/data.ts</code>, <code>lib/mongodb.ts</code>), the issue might still be due to browser extension interference, a network problem preventing data loading, or an issue with server-side data fetching (like database connection problems). Please check your browser extensions and ensure your environment variables (especially `MONGODB_URI` and `GEMINI_API_KEY`) are correctly set both locally in `.env` and in your Vercel project settings if deployed.
            </p>
        </CardContent>
     </Card>
  );

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center min-h-[calc(100vh-20rem)] bg-white">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg text-black">Loading SEO settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 bg-white">
      {errorExplanation}
      <Card className="shadow-sm rounded-lg max-w-4xl mx-auto bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-black flex items-center gap-2">
            <BarChart3 className="text-blue-600" /> SEO Management
          </CardTitle>
          <CardDescription className="text-black">Configure your website's SEO settings and meta information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <Alert variant="default" className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-700">SEO Configuration</AlertTitle>
              <AlertDescription className="text-blue-600">
                These settings provide global defaults for your site's SEO. For specific articles, you can set more granular SEO options on the article editing page. Full user role management for SEO specialists is a planned feature.
              </AlertDescription>
            </Alert>

            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="siteTitle"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-black">Site Title</FormLabel>
                                <FormControl><Input placeholder="Your Site Name" {...field} className="border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" /></FormControl>
                                <FormDescription className="text-black">The main title for your website (max 70 chars).</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="faviconUrl"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-black">Favicon URL</FormLabel>
                                <FormControl><Input placeholder="/favicon.ico or https://example.com/icon.png" {...field} className="border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" /></FormControl>
                                 <FormDescription className="text-black">URL to your site's favicon. This icon appears in browser tabs.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="metaDescription"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-black">Global Meta Description</FormLabel>
                            <FormControl><Textarea placeholder="A short description of your site for search engines." rows={3} {...field} className="border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" /></FormControl>
                            <FormDescription className="text-black">Default meta description (max 160 chars).</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="metaKeywords"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-black">Global Meta Keywords (comma-separated)</FormLabel>
                            <FormControl><Input placeholder="keyword1, keyword2, keyword3" {...field} className="border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" /></FormControl>
                            <FormDescription className="text-black">Default keywords. Use sparingly as they have less impact now.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                
                <h3 className="text-lg font-semibold pt-4 border-t mt-6 text-black">Open Graph Settings (for social sharing)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <FormField
                        control={form.control}
                        name="ogSiteName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-black">Open Graph Site Name</FormLabel>
                                <FormControl><Input placeholder="Your Site Name (for OG)" {...field} className="border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="ogLocale"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-black">Open Graph Locale</FormLabel>
                                <FormControl><Input placeholder="en_US or bn_BD" {...field} className="border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" /></FormControl>
                                <FormDescription className="text-black">e.g., en_US, bn_BD</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="ogType"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-black">Open Graph Type</FormLabel>
                                <FormControl><Input placeholder="website / article" {...field} className="border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" /></FormControl>
                                <FormDescription className="text-black">Usually "website" for homepage, "article" for articles.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <h3 className="text-lg font-semibold pt-4 border-t mt-6 text-black">Twitter Card Settings</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <FormField
                        control={form.control}
                        name="twitterCard"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-black">Twitter Card Type</FormLabel>
                                <FormControl>
                                    <select {...field} className="flex h-10 w-full items-center justify-between rounded-md border-2 border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none">
                                        <option value="summary">summary</option>
                                        <option value="summary_large_image">summary_large_image</option>
                                        <option value="app">app</option>
                                        <option value="player">player</option>
                                    </select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="twitterSite"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-black">Twitter Site Handle</FormLabel>
                                <FormControl><Input placeholder="@YourSiteTwitter" {...field} className="border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" /></FormControl>
                                <FormDescription className="text-black">Your site's Twitter username.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="twitterCreator"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-black">Twitter Creator Handle (Optional)</FormLabel>
                                <FormControl><Input placeholder="@AuthorTwitter" {...field} className="border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" /></FormControl>
                                <FormDescription className="text-black">Default author Twitter username (if applicable).</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <h3 className="text-lg font-semibold pt-4 border-t mt-6 text-black">Footer Social Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                        control={form.control}
                        name="footerYoutubeUrl"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex items-center gap-1 text-black"><Youtube className="h-4 w-4"/>YouTube URL</FormLabel>
                                <FormControl><Input type="url" placeholder="https://youtube.com/yourchannel" {...field} className="border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" /></FormControl>
                                <FormDescription className="text-black">Link to your YouTube channel for the site footer.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="footerFacebookUrl"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex items-center gap-1 text-black"><Facebook className="h-4 w-4"/>Facebook URL</FormLabel>
                                <FormControl><Input type="url" placeholder="https://facebook.com/yourpage" {...field} className="border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" /></FormControl>
                                <FormDescription className="text-black">Link to your Facebook page for the site footer.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="footerMoreLinksUrl"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex items-center gap-1 text-black"><LinkIcon className="h-4 w-4"/>More Links URL</FormLabel>
                                <FormControl><Input type="url" placeholder="https://example.com/social" {...field} className="border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" /></FormControl>
                                <FormDescription className="text-black">A general link for "More" in the site footer (e.g., a social hub page).</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                
                <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white">
                    {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save SEO Settings"}
                </Button>
            </form>
            </Form>
        </CardContent>
      </Card>
    </div>
  );
}

