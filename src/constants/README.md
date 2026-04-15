# Constants Directory

This directory contains all application-wide constants organized by domain.

## Structure

```
constants/
├── cache.constants.ts    # Cache-related constants (TTLs, keys, patterns)
├── index.ts             # Central export point
└── README.md            # This file
```

## Usage

### Import from the constants directory

```typescript
// ✅ Good - Import from constants
import { CacheTTL, CacheKeys, CachePatterns } from '../../constants';

// ❌ Bad - Don't import from service files
import { CacheTTL, CacheKeys } from '../../services/cache.service';
```

### Cache Constants

#### CacheTTL
Time-to-live values for different types of cached data (in seconds).

```typescript
import { CacheTTL } from '../../constants';

// Use in cache operations
cacheService.set('key', data, CacheTTL.LEADERBOARD_TOP);
```

Available TTLs:
- `LEADERBOARD_TOP`: 60s - Top N students
- `LEADERBOARD_FULL`: 30s - Full paginated leaderboard
- `LEADERBOARD_WEEKLY`: 60s - Weekly leaderboard
- `VIDEO_CATEGORIES`: 300s - Video categories list
- `VIDEO_LIST`: 180s - Videos list
- `VIDEOS_WITH_CATEGORIES`: 300s - Categories with nested videos
- `ADMIN_STATS`: 120s - Admin dashboard statistics
- `QUESTION_COUNT`: 600s - Question counts
- `USER_PROFILE`: 300s - User profile data
- `DEFAULT`: 60s - Default TTL

#### CacheKeys
Standardized cache key generators.

```typescript
import { CacheKeys } from '../../constants';

// Generate cache keys
const key = CacheKeys.leaderboardTop(10);
// Result: "leaderboard:top:10"

const videoKey = CacheKeys.videosByCategory('uuid', 1, 10);
// Result: "video:category:uuid:1:10"
```

Available key generators:
- `leaderboardTop(limit)`
- `leaderboardFull(period)`
- `leaderboardUser(userId, period)`
- `videoCategories(page, limit)`
- `videoCategoriesAll()`
- `videosWithCategories()`
- `videosByCategory(categoryId, page, limit)`
- `videoById(id)`
- `adminStats()`
- `adminUserList(page, limit)`
- `questionCount(category?, level?)`
- `questionById(id)`
- `userProfile(userId)`
- `userPoints(userId)`

#### CachePatterns
Patterns for bulk cache invalidation.

```typescript
import { CachePatterns } from '../../constants';

// Invalidate all leaderboard-related keys
cacheService.delPattern(CachePatterns.LEADERBOARD);

// Invalidate all video-related keys
cacheService.delPattern(CachePatterns.VIDEO);
```

Available patterns:
- `LEADERBOARD`: 'leaderboard'
- `VIDEO`: 'video'
- `ADMIN`: 'admin'
- `QUESTION`: 'question'
- `USER`: 'user'

## Adding New Constants

### 1. Create a new constants file

```typescript
// src/constants/auth.constants.ts
export const AuthConstants = {
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 900, // 15 minutes in seconds
  PASSWORD_MIN_LENGTH: 8,
} as const;

export const TokenExpiry = {
  ACCESS_TOKEN: '15m',
  REFRESH_TOKEN: '7d',
  VERIFY_CODE: '15m',
  RESET_CODE: '15m',
} as const;
```

### 2. Export from index.ts

```typescript
// src/constants/index.ts
export { CacheTTL, CacheKeys, CachePatterns } from './cache.constants';
export { AuthConstants, TokenExpiry } from './auth.constants';
```

### 3. Use in your code

```typescript
import { AuthConstants, TokenExpiry } from '../../constants';

if (attempts > AuthConstants.MAX_LOGIN_ATTEMPTS) {
  // Lock account
}

const token = jwt.sign(payload, secret, { expiresIn: TokenExpiry.ACCESS_TOKEN });
```

## Best Practices

### 1. Use `as const` for type safety

```typescript
export const MyConstants = {
  VALUE_ONE: 'value1',
  VALUE_TWO: 'value2',
} as const;

// TypeScript will infer literal types instead of string
```

### 2. Group related constants

```typescript
// ✅ Good - Grouped by domain
export const CacheTTL = { ... };
export const CacheKeys = { ... };

// ❌ Bad - Mixed concerns
export const Constants = {
  CACHE_TTL: 60,
  MAX_LOGIN_ATTEMPTS: 5,
  VIDEO_QUALITY: 'hd',
};
```

### 3. Use descriptive names

```typescript
// ✅ Good
export const CacheTTL = {
  LEADERBOARD_TOP: 60,
  VIDEO_CATEGORIES: 300,
};

// ❌ Bad
export const TTL = {
  LB: 60,
  VC: 300,
};
```

### 4. Document units and purpose

```typescript
export const CacheTTL = {
  LEADERBOARD_TOP: 60,  // 1 minute - Top N students
  VIDEO_LIST: 180,      // 3 minutes - Videos list
} as const;
```

## Migration Guide

If you have constants in other files, migrate them here:

### Before
```typescript
// In service file
const CACHE_TTL = 60;
const MAX_RETRIES = 3;
```

### After
```typescript
// In constants/service.constants.ts
export const ServiceConstants = {
  CACHE_TTL: 60,
  MAX_RETRIES: 3,
} as const;

// In service file
import { ServiceConstants } from '../../constants';
```

## Benefits

1. **Centralized**: All constants in one place
2. **Type-safe**: TypeScript literal types with `as const`
3. **Discoverable**: Easy to find and understand
4. **Maintainable**: Change once, update everywhere
5. **Testable**: Easy to mock in tests
6. **Documented**: Clear purpose and usage

## Related Files

- `src/services/cache.service.ts` - Cache service implementation
- `src/modules/*/` - Modules using these constants
