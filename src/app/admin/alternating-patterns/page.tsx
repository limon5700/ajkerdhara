"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Info } from "lucide-react";
import Link from "next/link";
import AlternatingPatternManager from "@/components/admin/AlternatingPatternManager";
import { useToast } from "@/hooks/use-toast";

export default function AlternatingPatternsPage() {
  const { toast } = useToast();

  const handleSaveConfigs = (configs: any[]) => {
    // This function can be extended to save to database
    console.log('Saving alternating pattern configs:', configs);
    
    // You can add database saving logic here
    // For now, it's saved to localStorage by the component
    
    toast({
      title: "Configuration Saved",
      description: "Your alternating pattern settings have been saved and will be applied to the website.",
    });
  };

  return (
    <div className="container mx-auto py-8 bg-white">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="sm" asChild className="border-gray-200 text-black hover:bg-gray-50">
          <Link href="/admin/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-black">Post-Ad Pattern Management</h1>
          <p className="text-black mt-1">
            Control how posts and advertisements alternate throughout your website
          </p>
        </div>
      </div>

      {/* Info Card */}
      <Card className="mb-8 border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-blue-800">
            <Info className="h-5 w-5" />
            How It Works
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-700">
          <div className="space-y-2 text-sm">
            <p>
              <strong>Post → Ad → Post → Ad Pattern:</strong> This is the default pattern that shows one post, 
              then one advertisement, alternating throughout the section.
            </p>
                         <p>
               <strong>Custom Patterns:</strong> You can create your own patterns using P (Post) and A (Ad) 
               separated by commas. For example: P,A,P,P,A,P will show Post → Ad → Post → Post → Ad → Post.
             </p>
             <p>
               <strong>Advanced Custom:</strong> Control where to start (Post or Ad) and how many posts to show 
               before each advertisement. Perfect for creating patterns like "2 posts, then 1 ad" or "start with ad, then 3 posts, then 1 ad".
             </p>
                         <p>
               <strong>Section Control:</strong> Each section of your website can have different patterns. 
               Control Latest Posts, Related Posts, Sidebar content, and more independently.
             </p>
             <p>
               <strong>Article Details Page:</strong> Special sections for news detail pages with separate ad placements 
               and patterns. Use <code>article-details-page</code> for the main content area and <code>article-details-sidebar</code> for sidebar content.
             </p>
             <p>
               <strong>Ad Placement Control:</strong> When adding ads, you can select exactly which page and where the ad will appear. 
               Each placement has specific behavior and sizing.
             </p>
            <p>
              <strong>Real-time Preview:</strong> See exactly how your pattern will look before saving.
            </p>
          </div>
        </CardContent>
      </Card>

             {/* Pattern Manager */}
       <AlternatingPatternManager onSave={handleSaveConfigs} />

               {/* Article Details Page Guide */}
        <Card className="mt-8 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-green-800">
              📰 Article Details Page Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-black">
            <div className="space-y-3 text-sm">
              <p>
                <strong>News Detail Pages</strong> now have their own dedicated sections for better control:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="bg-white p-3 rounded border">
                  <h4 className="font-semibold text-green-800 mb-2">📱 Main Content Area</h4>
                  <p className="text-sm text-green-700">
                    <strong>Section:</strong> <code>article-details-page</code><br/>
                    <strong>Use for:</strong> Related articles grid below the main article<br/>
                    <strong>Recommended:</strong> Start with posts, show 2-3 posts before ads
                  </p>
                </div>
                <div className="bg-white p-3 rounded border">
                  <h4 className="font-semibold text-green-800 mb-2">📋 Sidebar Content</h4>
                  <p className="text-sm text-green-700">
                    <strong>Section:</strong> <code>article-details-sidebar</code><br/>
                    <strong>Use for:</strong> Sidebar article lists<br/>
                    <strong>Recommended:</strong> Start with posts, show 4-5 posts before ads
                  </p>
                </div>
              </div>
              <p className="mt-3 text-xs text-green-600">
                💡 <strong>Tip:</strong> Article detail pages can now have completely different patterns from your homepage, 
                giving you full control over user experience and monetization on each page type.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Ad Placement Guide */}
        <Card className="mt-8 border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-purple-800">
              🎯 Ad Placement Guide - Where Ads Will Show
            </CardTitle>
          </CardHeader>
          <CardContent className="text-purple-700">
            <div className="space-y-4 text-sm">
              <p>
                <strong>When adding ads, you can select exactly where they will appear:</strong>
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Homepage Placements */}
                <div className="bg-white p-3 rounded border border-purple-200">
                  <h4 className="font-semibold text-purple-800 mb-2">🏠 Homepage Ads</h4>
                  <div className="space-y-1 text-xs">
                    <p><strong>Hero Section:</strong> Large banner at top</p>
                    <p><strong>Latest Posts:</strong> Above article grid</p>
                    <p><strong>More Headlines:</strong> In headlines section</p>
                    <p><strong>Sidebar:</strong> In "Must Read" section</p>
                    <p><strong>Between Articles:</strong> Every 2-3 posts</p>
                    <p><strong>Bottom:</strong> End of homepage</p>
                  </div>
                </div>

                {/* Article Page Placements */}
                <div className="bg-white p-3 rounded border border-purple-200">
                  <h4 className="font-semibold text-purple-800 mb-2">📰 Article Page Ads</h4>
                  <div className="space-y-1 text-xs">
                    <p><strong>Top:</strong> Above article content</p>
                    <p><strong>Bottom:</strong> Below article content</p>
                    <p><strong>Inline:</strong> Inside article (use [AD_INLINE])</p>
                    <p><strong>Related Articles:</strong> Above related posts</p>
                    <p><strong>Main Content:</strong> In posts/ads grid</p>
                    <p><strong>Sidebar:</strong> In sidebar lists</p>
                  </div>
                </div>

                {/* Sidebar & Header/Footer */}
                <div className="bg-white p-3 rounded border border-purple-200">
                  <h4 className="font-semibold text-purple-800 mb-2">📍 Sidebar & Header/Footer</h4>
                  <div className="space-y-1 text-xs">
                    <p><strong>Left Sidebar:</strong> All pages with left sidebar</p>
                    <p><strong>Right Sidebar:</strong> All pages with right sidebar</p>
                    <p><strong>Header Logo:</strong> Logo area on all pages</p>
                    <p><strong>Below Header:</strong> Full width below header</p>
                    <p><strong>Footer:</strong> Bottom of all pages</p>
                  </div>
                </div>

                {/* Targeting Options */}
                <div className="bg-white p-3 rounded border border-purple-200">
                  <h4 className="font-semibold text-purple-800 mb-2">🎯 Advanced Targeting</h4>
                  <div className="space-y-1 text-xs">
                    <p><strong>Article-Specific:</strong> Show only on specific articles</p>
                    <p><strong>Category-Specific:</strong> Show only on specific categories</p>
                    <p><strong>Page-Specific:</strong> Homepage vs Article pages</p>
                    <p><strong>Size Control:</strong> Small, Medium, Large, Full-width</p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-100 p-3 rounded border border-purple-300">
                <h4 className="font-semibold text-purple-800 mb-2">💡 How to Set Up Ads for Different Pages:</h4>
                <ol className="list-decimal pl-5 space-y-1 text-xs">
                  <li><strong>Go to Admin → Layout & Gadgets → Add New Gadget</strong></li>
                  <li><strong>Select Placement:</strong> Choose exactly where the ad will appear</li>
                  <li><strong>Set Targeting:</strong> Choose specific articles or categories if needed</li>
                  <li><strong>Configure Pattern:</strong> Come back here to set alternating patterns</li>
                  <li><strong>Test:</strong> Visit the pages to see your ads in action</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>

       {/* Additional Help */}
      <Card className="mt-8 border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg text-black">Need Help?</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-black">
          <div className="space-y-2">
            <p>
              <strong>Pattern Examples:</strong>
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><code>P,A,P,A</code> - Post → Ad → Post → Ad (every other item is an ad)</li>
              <li><code>P,P,A,P,P,A</code> - Post → Post → Ad → Post → Post → Ad (2 posts, then 1 ad)</li>
              <li><code>A,P,A,P</code> - Ad → Post → Ad → Post (starts with ad)</li>
              <li><strong>Advanced Custom:</strong></li>
              <li><code>Start: Post, Posts Before Ad: 2</code> - Post → Post → Ad → Post → Post → Ad</li>
              <li><code>Start: Ad, Posts Before Ad: 3</code> - Ad → Post → Post → Post → Ad → Post → Post → Post → Ad</li>
              <li><strong>Article Details Page Examples:</strong></li>
              <li><code>article-details-page</code> - Main content area with custom patterns</li>
              <li><code>article-details-sidebar</code> - Sidebar with different ad frequency</li>
            </ul>
            <p className="mt-3">
              <strong>Note:</strong> Changes are saved locally and will be applied when you refresh your website. 
              For production, consider saving these settings to your database.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
