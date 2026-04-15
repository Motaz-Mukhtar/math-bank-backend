import NodeCache from 'node-cache';
import { CacheTTL } from '../constants';

/**
 * In-memory cache service using node-cache
 * Used for caching frequently accessed data like leaderboards, stats, etc.
 */
class CacheService {
  private cache: NodeCache;

  constructor() {
    this.cache = new NodeCache({
      stdTTL: CacheTTL.DEFAULT, // Default TTL: 60 seconds
      checkperiod: 30, // Check for expired keys every 30 seconds
      useClones: false, // Don't clone objects (better performance)
    });

    // Log cache statistics in development
    if (process.env.NODE_ENV === 'development') {
      setInterval(() => {
        const stats = this.cache.getStats();
        if (stats.keys > 0) {
          console.log('[Cache Stats]', {
            keys: stats.keys,
            hits: stats.hits,
            misses: stats.misses,
            hitRate: stats.hits / (stats.hits + stats.misses) || 0,
          });
        }
      }, 60000); // Log every minute
    }
  }

  /**
   * Get value from cache
   */
  get<T>(key: string): T | undefined {
    return this.cache.get<T>(key);
  }

  /**
   * Set value in cache with optional TTL
   */
  set<T>(key: string, value: T, ttl?: number): boolean {
    return this.cache.set(key, value, ttl ?? CacheTTL.DEFAULT);
  }

  /**
   * Delete specific key from cache
   */
  del(key: string): number {
    return this.cache.del(key);
  }

  /**
   * Delete multiple keys matching a pattern
   */
  delPattern(pattern: string): number {
    const keys = this.cache.keys();
    const matchingKeys = keys.filter(key => key.includes(pattern));
    return this.cache.del(matchingKeys);
  }

  /**
   * Check if key exists in cache
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * Flush all cache entries
   */
  flush(): void {
    this.cache.flushAll();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return this.cache.getStats();
  }
}

// Export singleton instance
export const cacheService = new CacheService();

// Re-export constants for convenience
export { CacheTTL, CacheKeys, CachePatterns } from '../constants';
