/**
 * Cache TTL (Time To Live) constants in seconds
 * Defines how long different types of data should be cached
 */
export const CacheTTL = {
  // Leaderboard caching
  LEADERBOARD_TOP: 60,        // 1 minute - Top N students
  LEADERBOARD_FULL: 30,       // 30 seconds - Full paginated leaderboard
  LEADERBOARD_WEEKLY: 60,     // 1 minute - Weekly leaderboard
  
  // Video caching
  VIDEO_CATEGORIES: 300,      // 5 minutes - Video categories list
  VIDEO_LIST: 180,            // 3 minutes - Videos list
  VIDEOS_WITH_CATEGORIES: 300, // 5 minutes - Categories with nested videos
  
  // Admin caching
  ADMIN_STATS: 120,           // 2 minutes - Admin dashboard statistics
  
  // Question caching
  QUESTION_COUNT: 600,        // 10 minutes - Question counts by category/level
  
  // User caching
  USER_PROFILE: 300,          // 5 minutes - User profile data
  
  // Default
  DEFAULT: 60,                // 1 minute - Default TTL for uncategorized data
} as const;

/**
 * Cache key generators for consistent naming
 * Provides standardized cache key formats across the application
 */
export const CacheKeys = {
  // Leaderboard keys
  leaderboardTop: (limit: number) => `leaderboard:top:${limit}`,
  leaderboardFull: (period: 'all' | 'weekly') => `leaderboard:full:${period}`,
  leaderboardUser: (userId: string, period: 'all' | 'weekly') => 
    `leaderboard:user:${userId}:${period}`,
  
  // Video keys
  videoCategories: (page: number, limit: number) => `video:categories:${page}:${limit}`,
  videoCategoriesAll: () => `video:categories:all`,
  videosWithCategories: () => `video:categories:with-videos`,
  videosByCategory: (categoryId: string, page: number, limit: number) => 
    `video:category:${categoryId}:${page}:${limit}`,
  videoById: (id: string) => `video:${id}`,
  
  // Admin keys
  adminStats: () => `admin:stats`,
  adminUserList: (page: number, limit: number) => `admin:users:${page}:${limit}`,
  
  // Question keys
  questionCount: (category?: string, level?: string) => 
    `question:count:${category || 'all'}:${level || 'all'}`,
  questionById: (id: string) => `question:${id}`,
  
  // User keys
  userProfile: (userId: string) => `user:profile:${userId}`,
  userPoints: (userId: string) => `user:points:${userId}`,
} as const;

/**
 * Cache key patterns for bulk invalidation
 * Used with delPattern() to invalidate multiple related keys
 */
export const CachePatterns = {
  LEADERBOARD: 'leaderboard',
  VIDEO: 'video',
  ADMIN: 'admin',
  QUESTION: 'question',
  USER: 'user',
} as const;