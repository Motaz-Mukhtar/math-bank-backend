import { QuizCategory } from '@prisma/client';
import { LeaderboardRepository } from './leaderboard.repository';
import { LeaderboardEntry } from '../../types';

export interface Badge {
  key: string;
  labelAr: string;
  icon: string;
  color: 'teal' | 'amber' | 'coral' | 'purple' | 'green';
}

const CATEGORY_LABELS: Record<QuizCategory, string> = {
  ADDITION: 'الجمع',
  SUBTRACTION: 'الطرح',
  MULTIPLICATION: 'الضرب',
  DIVISION: 'القسمة',
  COMPARISON: 'المقارنة',
  GEOMETRY: 'الهندسة',
  FRACTIONS: 'الكسور',
  MEASUREMENT: 'القياس',
  TIME: 'الوقت',
  PLACE_VALUE: 'القيمة المكانية',
  PATTERNS: 'الأنماط',
  DATA: 'البيانات',
};

// Priority order: highest first
const BADGE_PRIORITY = [
  'WEEKLY_STAR',
  'FAST_CLIMBER',
  'CONSISTENT',
  'CATEGORY_CHAMPION',
  'NEW_COMER',
];

export async function computeBadgesForUser(
  userId: string,
  repo: LeaderboardRepository
): Promise<Badge[]> {
  const earned: Badge[] = [];

  const [weeklyTop, pts24h, activeDays, hasSession, createdAt, breakdown] =
    await Promise.all([
      repo.getWeeklyTopUserId(),
      repo.getPointsLast24h(userId),
      repo.getActiveDaysLast7(userId),
      repo.hasAnySession(userId),
      repo.getUserCreatedAt(userId),
      repo.getCategoryBreakdown(userId),
    ]);

  if (weeklyTop === userId) {
    earned.push({ key: 'WEEKLY_STAR', labelAr: 'نجم الأسبوع', icon: 'star', color: 'amber' });
  }

  if (pts24h >= 50) {
    earned.push({ key: 'FAST_CLIMBER', labelAr: 'متقدم سريع', icon: 'rocket', color: 'purple' });
  }

  if (activeDays >= 5) {
    earned.push({ key: 'CONSISTENT', labelAr: 'متسق', icon: 'fire', color: 'coral' });
  }

  if (breakdown.length > 0) {
    const topCat = breakdown[0].category;
    const leader = await repo.getCategoryLeader(topCat);
    if (leader === userId) {
      earned.push({
        key: 'CATEGORY_CHAMPION',
        labelAr: `بطل ${CATEGORY_LABELS[topCat]}`,
        icon: 'trophy',
        color: 'teal',
      });
    }
  }

  if (createdAt) {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    if (createdAt >= sevenDaysAgo && hasSession) {
      earned.push({ key: 'NEW_COMER', labelAr: 'وافد جديد', icon: 'sparkle', color: 'green' });
    }
  }

  // Sort by priority and cap at 3
  earned.sort(
    (a, b) => BADGE_PRIORITY.indexOf(a.key) - BADGE_PRIORITY.indexOf(b.key)
  );
  return earned.slice(0, 3);
}

export async function computeBadgesForLeaderboard(
  entries: LeaderboardEntry[],
  repo: LeaderboardRepository
): Promise<Map<string, Badge[]>> {
  const result = new Map<string, Badge[]>();
  // Compute in parallel but cap concurrency to avoid DB overload
  await Promise.all(
    entries.map(async (e) => {
      const badges = await computeBadgesForUser(e.userId, repo);
      result.set(e.userId, badges);
    })
  );
  return result;
}
