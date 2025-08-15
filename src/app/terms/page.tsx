
"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function TermsPage() {
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
            <CardTitle className="text-2xl font-bold text-primary">Terms and Conditions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 prose dark:prose-invert max-w-none">
            <div>
              <h3 className="font-semibold text-lg">1. Acceptance of Terms</h3>
              <p>By accessing or using Clypio (the "Service"), you agree to be bound by these Terms and Conditions. If you disagree with any part of the terms, then you may not access the Service.</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg">2. Use of Service</h3>
              <p>The Service provides news summaries and articles. You agree to use the Service for lawful purposes only and in a way that does not infringe the rights of, restrict or inhibit anyone else's use and enjoyment of the Service. Content provided is for informational purposes.</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg">3. Content Disclaimer</h3>
              <p>The Service aggregates news content from various sources. While we strive for accuracy, we cannot guarantee the completeness or accuracy of all information. You acknowledge that reliance on such content is at your own risk.</p>
            </div>
             <div>
              <h3 className="font-semibold text-lg">4. Modifications to Terms</h3>
              <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days' notice prior to any new terms taking effect.</p>
            </div>
             <div>
              <h3 className="font-semibold text-lg">5. Contact Us</h3>
              <p>If you have any questions about these Terms, please contact us through our website.</p>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
