"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import AlternatingPostsAndAds from "@/components/news/AlternatingPostsAndAds";
import type { NewsArticle, Gadget } from "@/lib/types";
import { Info } from "lucide-react";

// Mock data for demo
const mockArticles: NewsArticle[] = [
  {
    id: '1',
    title: 'Sample Article 1',
    content: 'This is a sample article content for demonstration purposes.',
    excerpt: 'Sample excerpt for article 1',
    category: 'Technology',
    publishedDate: new Date().toISOString(),
    imageUrl: '/placeholder-image.svg'
  },
  {
    id: '2',
    title: 'Sample Article 2',
    content: 'This is another sample article content for demonstration.',
    excerpt: 'Sample excerpt for article 2',
    category: 'Business',
    publishedDate: new Date().toISOString(),
    imageUrl: '/placeholder-image.svg'
  },
  {
    id: '3',
    title: 'Sample Article 3',
    content: 'This is the third sample article content for demonstration.',
    excerpt: 'Sample excerpt for article 3',
    category: 'Sports',
    publishedDate: new Date().toISOString(),
    imageUrl: '/placeholder-image.svg'
  },
  {
    id: '4',
    title: 'Sample Article 4',
    content: 'This is the fourth sample article content for demonstration.',
    excerpt: 'Sample excerpt for article 4',
    category: 'World',
    publishedDate: new Date().toISOString(),
    imageUrl: '/placeholder-image.svg'
  },
  {
    id: '5',
    title: 'Sample Article 5',
    content: 'This is the fifth sample article content for demonstration.',
    excerpt: 'Sample excerpt for article 5',
    category: 'Entertainment',
    publishedDate: new Date().toISOString(),
    imageUrl: '/placeholder-image.svg'
  },
  {
    id: '6',
    title: 'Sample Article 6',
    content: 'This is the sixth sample article content for demonstration.',
    excerpt: 'Sample excerpt for article 6',
    category: 'Technology',
    publishedDate: new Date().toISOString(),
    imageUrl: '/placeholder-image.svg'
  }
];

const mockAds: Gadget[] = [
  {
    id: 'ad1',
    section: 'homepage-latest-posts',
    content: '<div class="bg-blue-100 p-4 rounded-lg text-center"><strong>Advertisement 1</strong><br/>This is a sample advertisement</div>',
    isActive: true,
    adType: 'html',
    unifiedPlacement: 'homepage-latest-posts',
    placementSize: 'medium'
  },
  {
    id: 'ad2',
    section: 'homepage-latest-posts',
    content: '<div class="bg-green-100 p-4 rounded-lg text-center"><strong>Advertisement 2</strong><br/>Another sample advertisement</div>',
    isActive: true,
    adType: 'html',
    unifiedPlacement: 'homepage-latest-posts',
    placementSize: 'medium'
  },
  {
    id: 'ad3',
    section: 'homepage-latest-posts',
    content: '<div class="bg-yellow-100 p-4 rounded-lg text-center"><strong>Advertisement 3</strong><br/>Third sample advertisement</div>',
    isActive: true,
    adType: 'html',
    unifiedPlacement: 'homepage-latest-posts',
    placementSize: 'medium'
  }
];

export default function DemoPage() {
  const [currentSection, setCurrentSection] = useState('homepage-latest-posts');

  const sections = [
    { id: 'homepage-latest-posts', name: 'Latest Posts (Grid)', layout: 'grid' as const },
    { id: 'homepage-more-headlines', name: 'More Headlines (2-Column Grid)', layout: 'grid-2' as const },
    { id: 'sidebar-right', name: 'Sidebar (List)', layout: 'list' as const },
    { id: 'article-related', name: 'Related Posts (Grid)', layout: 'grid' as const },
    { id: 'article-details-page', name: 'Article Details Page (Grid)', layout: 'grid' as const },
    { id: 'article-details-sidebar', name: 'Article Details Sidebar (List)', layout: 'list' as const }
  ];

  return (
    <div className="container mx-auto py-8 bg-white">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="sm" asChild className="border-gray-200 text-black hover:bg-gray-50">
          <Link href="/admin/alternating-patterns">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Pattern Management
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-black">Pattern Demo</h1>
          <p className="text-black mt-1">
            See how your alternating patterns will look on the actual website
          </p>
        </div>
      </div>

      {/* Section Selector */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Select Section to Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {sections.map((section) => (
              <Button
                key={section.id}
                variant={currentSection === section.id ? "default" : "outline"}
                onClick={() => setCurrentSection(section.id)}
              >
                {section.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pattern Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-black">Pattern Preview</CardTitle>
          <p className="text-sm text-black">
            This shows how your configured pattern will look. Configure patterns in the Pattern Manager above.
          </p>
        </CardHeader>
        <CardContent>
          <AlternatingPostsAndAds
            articles={mockArticles}
            ads={mockAds}
            title={`${sections.find(s => s.id === currentSection)?.name} Preview`}
            layout={sections.find(s => s.id === currentSection)?.layout || 'grid'}
            maxItems={8}
            section={currentSection}
          />
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="mt-8 border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-green-800">
            📊 Pattern Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-black">
          <div className="space-y-2">
            <p><strong>Total Articles:</strong> {mockArticles.length}</p>
            <p><strong>Total Ads:</strong> {mockAds.length}</p>
            <p><strong>Current Section:</strong> {currentSection}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-8 border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-blue-800">
            <Info className="h-5 w-5" />
            Demo Information
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-black">
          <p>
            This demo shows how your alternating patterns will look on the actual website. 
            You can switch between different sections to see how each pattern affects the layout.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
