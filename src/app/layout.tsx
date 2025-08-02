
import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AppProvider } from '@/context/AppContext';
import { getSeoSettings } from '@/lib/data';
import { PerformanceMonitor } from '@/components/ui/performance-monitor'; 

export async function generateMetadata(): Promise<Metadata> {
  const seoSettings = await getSeoSettings();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:9002'; 

  const title = seoSettings?.siteTitle || 'আজকের ধারা | AjkerDhara';
  const description = seoSettings?.metaDescription || 'Your concise news source, powered by AI.';
  
  const metadataBase = siteUrl ? new URL(siteUrl) : undefined;

  const otherMetaTags: Record<string, string> = {};
  if (process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION) {
    otherMetaTags['google-site-verification'] = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
  }

  return {
    metadataBase,
    title: {
      default: title,
      template: `%s | ${title}`, 
    },
    description: description,
    keywords: seoSettings?.metaKeywords || ['news', 'bangla news', 'ai news', 'latest news', 'technology', 'sports'],
          authors: [{ name: 'AjkerDhara Team', url: siteUrl }],
      creator: 'AjkerDhara Team',
      publisher: 'AjkerDhara',
    alternates: {
      canonical: '/',
    },
    icons: {
      icon: seoSettings?.faviconUrl || '/favicon.ico', 
      shortcut: seoSettings?.faviconUrl || '/favicon.ico',
      apple: '/apple-touch-icon.png', 
    },
    openGraph: {
      title: title,
      description: description,
      url: siteUrl,
      siteName: seoSettings?.ogSiteName || title,
      images: [
        {
          url: `${siteUrl}/og-image.png`, 
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: seoSettings?.ogLocale || 'bn_BD',
      type: (seoSettings?.ogType as "website" | "article" | "book" | "profile" | "music.song" | "music.album" | "music.playlist" | "music.radio_station" | "video.movie" | "video.episode" | "video.tv_show" | "video.other") || 'website',
    },
    twitter: {
      card: (seoSettings?.twitterCard as "summary" | "summary_large_image" | "app" | "player") || 'summary_large_image',
      title: title,
      description: description,
      site: seoSettings?.twitterSite, 
      creator: seoSettings?.twitterCreator, 
      images: [`${siteUrl}/twitter-image.png`], 
    },
    robots: { 
      index: true,
      follow: true,
      nocache: true, 
      googleBot: {
        index: true,
        follow: true,
        noimageindex: false, 
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    // manifest: `${siteUrl}/site.webmanifest`, 
    other: otherMetaTags,
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' }, 
    { media: '(prefers-color-scheme: dark)', color: '#262b33' },  
  ],
  colorScheme: 'light dark',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <body className={`antialiased font-sans bg-background text-foreground`} suppressHydrationWarning>
        <AppProvider>
          {children}
          <Toaster />
          <PerformanceMonitor />
        </AppProvider>
      </body>
    </html>
  );
}
