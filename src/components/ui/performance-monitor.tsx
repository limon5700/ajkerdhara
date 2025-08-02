"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';

interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development mode
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    const measurePerformance = () => {
      if ('performance' in window) {
        const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        // Get Core Web Vitals
        const fcp = performance.getEntriesByName('first-contentful-paint')[0] as PerformanceEntry;
        const lcp = performance.getEntriesByName('largest-contentful-paint')[0] as PerformanceEntry;
        
        setMetrics({
          fcp: fcp ? fcp.startTime : 0,
          lcp: lcp ? lcp.startTime : 0,
          fid: 0, // Would need to be measured with event listeners
          cls: 0, // Would need to be measured with LayoutShift API
          ttfb: perfData ? perfData.responseStart - perfData.requestStart : 0,
        });
      }
    };

    // Measure after page load
    if (document.readyState === 'complete') {
      measurePerformance();
    } else {
      window.addEventListener('load', measurePerformance);
    }

    // Show monitor after 2 seconds
    const timer = setTimeout(() => setIsVisible(true), 2000);

    return () => {
      window.removeEventListener('load', measurePerformance);
      clearTimeout(timer);
    };
  }, []);

  if (!isVisible || !metrics) {
    return null;
  }

  const getScoreColor = (value: number, threshold: number) => {
    return value <= threshold ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getScoreLabel = (value: number, threshold: number) => {
    return value <= threshold ? 'Good' : 'Needs Improvement';
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            Performance Monitor
            <Badge variant="outline" className="text-xs">
              Dev Mode
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-600">FCP:</span>
              <Badge className={`ml-1 ${getScoreColor(metrics.fcp, 1800)}`}>
                {Math.round(metrics.fcp)}ms
              </Badge>
            </div>
            <div>
              <span className="text-gray-600">LCP:</span>
              <Badge className={`ml-1 ${getScoreColor(metrics.lcp, 2500)}`}>
                {Math.round(metrics.lcp)}ms
              </Badge>
            </div>
            <div>
              <span className="text-gray-600">TTFB:</span>
              <Badge className={`ml-1 ${getScoreColor(metrics.ttfb, 600)}`}>
                {Math.round(metrics.ttfb)}ms
              </Badge>
            </div>
            <div>
              <span className="text-gray-600">FID:</span>
              <Badge className="ml-1 bg-gray-100 text-gray-800">
                {metrics.fid}ms
              </Badge>
            </div>
          </div>
          
          <div className="pt-2 border-t">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-600">Bundle Size:</span>
                          <span className="font-mono">
              {Math.round((performance as any).memory?.usedJSHeapSize / 1024 / 1024 || 0)}MB
            </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Hook for measuring component render time
export function useRenderTime(componentName: string) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const startTime = performance.now();
      
      return () => {
        const endTime = performance.now();
        const renderTime = endTime - startTime;
        
        if (renderTime > 16) { // 16ms = 60fps threshold
          console.warn(`⚠️ ${componentName} took ${renderTime.toFixed(2)}ms to render (slow)`);
        } else {
          console.log(`✅ ${componentName} rendered in ${renderTime.toFixed(2)}ms`);
        }
      };
    }
  }, [componentName]);
}

// Hook for measuring data fetching time
export function useFetchTime<T>(
  fetchFn: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchTime, setFetchTime] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const startTime = performance.now();
      setLoading(true);
      
      try {
        const result = await fetchFn();
        setData(result);
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        const endTime = performance.now();
        const time = endTime - startTime;
        setFetchTime(time);
        setLoading(false);
        
        if (process.env.NODE_ENV === 'development') {
          if (time > 1000) {
            console.warn(`⚠️ Data fetch took ${time.toFixed(2)}ms (slow)`);
          } else {
            console.log(`✅ Data fetched in ${time.toFixed(2)}ms`);
          }
        }
      }
    };

    fetchData();
  }, dependencies);

  return { data, loading, fetchTime };
} 