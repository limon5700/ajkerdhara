"use client";

import { Suspense, lazy, ComponentType } from 'react';
import { Skeleton } from './skeleton';

interface LazyLoadProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

// Default fallback component
const DefaultFallback = () => (
  <div className="w-full space-y-3">
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
  </div>
);

export function LazyLoad({ children, fallback = <DefaultFallback /> }: LazyLoadProps) {
  return <Suspense fallback={fallback}>{children}</Suspense>;
}

// Predefined lazy components for common use cases
export const LazyNewsCard = lazy(() => import('@/components/news/NewsCard'));
export const LazyFeaturedArticleCard = lazy(() => import('@/components/news/FeaturedArticleCard'));
export const LazySidebarArticleCard = lazy(() => import('@/components/news/SidebarArticleCard')); 