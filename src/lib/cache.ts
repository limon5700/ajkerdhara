interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Clear expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache statistics
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Global cache instance
export const cache = new MemoryCache();

// Cache keys
export const CACHE_KEYS = {
  ARTICLES: 'articles',
  ARTICLE: (id: string) => `article:${id}`,
  RELATED_ARTICLES: (id: string) => `related_articles:${id}`,
  GADGETS: (section: string) => `gadgets:${section}`,
  SEO_SETTINGS: 'seo_settings',
  USERS: 'users',
  ROLES: 'roles',
  ANALYTICS: 'analytics',
} as const;

// Cache decorator for functions
export function withCache<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  keyGenerator: (...args: Parameters<T>) => string,
  ttl: number = 5 * 60 * 1000
): T {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const key = keyGenerator(...args);
    const cached = cache.get<ReturnType<T>>(key);
    
    if (cached !== null) {
      return cached;
    }

    const result = await fn(...args);
    cache.set(key, result, ttl);
    return result;
  }) as T;
}

// Utility function to invalidate cache
export function invalidateCache(pattern: string): void {
  const stats = cache.getStats();
  for (const key of stats.keys) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
}

// Clear articles cache specifically
export function clearArticlesCache(): void {
  invalidateCache('articles');
  invalidateCache('article:');
  invalidateCache('related_articles:');
}

// Force refresh all cache
export function forceRefreshCache(): void {
  cache.clear();
}

// Auto-cleanup every 10 minutes
if (typeof window === 'undefined') {
  setInterval(() => {
    cache.cleanup();
  }, 10 * 60 * 1000);
} 