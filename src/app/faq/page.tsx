
"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation"; // Using next/navigation for App Router

export default function FAQPage() {
  const { isClient } = useAppContext();
  const router = useRouter();


  if (!isClient) {
    // Simple loading state or placeholder for SSR
    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
         {/* Minimal header without dynamic text for SSR */}
        <header className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <div className="text-3xl font-bold text-primary">Loading...</div>
            </div>
        </header>
        <main className="flex-grow container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Loading...</h1>
            <p>Loading content...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header onSearch={(term) => router.push(`/?search=${term}`)} />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Card className="shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-primary">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 prose dark:prose-invert max-w-none">
            <div>
              <h3 className="font-semibold text-lg">Q1: What is Clypio?</h3>
<p>Clypio is your source for global stories in a snap - a news application that uses AI to provide you with quick summaries and translations of news articles from around the world.</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg">Q2: How do I search for articles?</h3>
              <p>You can search for articles using the search bar in the header. Simply type your keywords and press enter.</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg">Q3: How do I filter articles by category?</h3>
              <p>Use the category buttons below the header to filter articles by Technology, Sports, Business, World, or Entertainment. Click "All" to see all articles.</p>
            </div>
             <div>
              <h3 className="font-semibold text-lg">Q4: How often is the content updated?</h3>
              <p>Our content is updated regularly throughout the day to bring you the latest global stories as they happen.</p>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
