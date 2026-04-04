/**
 * Diagnostic script to check weekly leaderboard data
 * Run with: npx ts-node src/scripts/check-weekly-data.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function getWeekStart(): Date {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun … 6=Sat
  const daysSinceSaturday = (dayOfWeek + 1) % 7;
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - daysSinceSaturday);
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
}

async function checkWeeklyData() {
  console.log('🔍 Checking Weekly Leaderboard Data\n');
  console.log('═'.repeat(60));

  const now = new Date();
  const weekStart = getWeekStart();
  
  console.log(`📅 Current Date: ${now.toISOString()}`);
  console.log(`📅 Week Start (Saturday): ${weekStart.toISOString()}`);
  console.log(`📅 Days since week start: ${Math.floor((now.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24))}`);
  console.log('═'.repeat(60));
  console.log();

  // Check quiz sessions this week
  const quizSessions = await prisma.quizSession.findMany({
    where: { createdAt: { gte: weekStart } },
    include: {
      user: { select: { fullName: true, academicNumber: true } },
      items: { select: { pointsEarned: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  console.log(`📊 Quiz Sessions This Week: ${quizSessions.length}`);
  if (quizSessions.length > 0) {
    console.log('\nRecent Quiz Sessions:');
    quizSessions.slice(0, 5).forEach((session, i) => {
      const totalPoints = session.items.reduce((sum, item) => sum + (item.pointsEarned || 0), 0);
      console.log(`  ${i + 1}. ${session.user.fullName} (${session.user.academicNumber || 'N/A'})`);
      console.log(`     Points: ${totalPoints}, Date: ${session.createdAt.toISOString()}`);
    });
  } else {
    console.log('  ❌ No quiz sessions found this week');
  }
  console.log();

  // Check wheel sessions this week
  const wheelSessions = await prisma.wheelSession.findMany({
    where: { createdAt: { gte: weekStart } },
    include: {
      user: { select: { fullName: true, academicNumber: true } },
      items: { select: { pointsEarned: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  console.log(`🎡 Wheel Sessions This Week: ${wheelSessions.length}`);
  if (wheelSessions.length > 0) {
    console.log('\nRecent Wheel Sessions:');
    wheelSessions.slice(0, 5).forEach((session, i) => {
      const totalPoints = session.items.reduce((sum, item) => sum + (item.pointsEarned || 0), 0);
      console.log(`  ${i + 1}. ${session.user.fullName} (${session.user.academicNumber || 'N/A'})`);
      console.log(`     Points: ${totalPoints}, Date: ${session.createdAt.toISOString()}`);
    });
  } else {
    console.log('  ❌ No wheel sessions found this week');
  }
  console.log();

  // Aggregate weekly points by user
  if (quizSessions.length > 0 || wheelSessions.length > 0) {
    const userPoints = new Map<string, { name: string; points: number }>();

    for (const session of quizSessions) {
      const points = session.items.reduce((sum, item) => sum + (item.pointsEarned || 0), 0);
      const existing = userPoints.get(session.userId) || { name: session.user.fullName, points: 0 };
      userPoints.set(session.userId, { name: existing.name, points: existing.points + points });
    }

    for (const session of wheelSessions) {
      const points = session.items.reduce((sum, item) => sum + (item.pointsEarned || 0), 0);
      const existing = userPoints.get(session.userId) || { name: session.user.fullName, points: 0 };
      userPoints.set(session.userId, { name: existing.name, points: existing.points + points });
    }

    console.log('🏆 Weekly Leaderboard (Top 10):');
    console.log('═'.repeat(60));
    const sorted = Array.from(userPoints.entries())
      .map(([userId, data]) => ({ userId, ...data }))
      .sort((a, b) => b.points - a.points)
      .slice(0, 10);

    sorted.forEach((user, i) => {
      console.log(`  ${i + 1}. ${user.name} - ${user.points} points`);
    });
    console.log();
  }

  // Check all-time data for comparison
  const allTimeQuizSessions = await prisma.quizSession.count();
  const allTimeWheelSessions = await prisma.wheelSession.count();
  
  console.log('📈 All-Time Statistics:');
  console.log(`  Total Quiz Sessions: ${allTimeQuizSessions}`);
  console.log(`  Total Wheel Sessions: ${allTimeWheelSessions}`);
  console.log();

  // Check most recent session
  const mostRecentQuiz = await prisma.quizSession.findFirst({
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { fullName: true } } },
  });

  const mostRecentWheel = await prisma.wheelSession.findFirst({
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { fullName: true } } },
  });

  console.log('🕐 Most Recent Activity:');
  if (mostRecentQuiz) {
    console.log(`  Last Quiz: ${mostRecentQuiz.user.fullName} at ${mostRecentQuiz.createdAt.toISOString()}`);
  }
  if (mostRecentWheel) {
    console.log(`  Last Wheel: ${mostRecentWheel.user.fullName} at ${mostRecentWheel.createdAt.toISOString()}`);
  }
  console.log();

  console.log('═'.repeat(60));
  console.log('✅ Diagnostic Complete');
  console.log();

  if (quizSessions.length === 0 && wheelSessions.length === 0) {
    console.log('💡 RECOMMENDATION:');
    console.log('   No activity found this week. To test the weekly leaderboard:');
    console.log('   1. Login as a student');
    console.log('   2. Complete a quiz or spin the wheel');
    console.log('   3. Refresh the leaderboard page');
    console.log();
  }
}

checkWeeklyData()
  .catch((error) => {
    console.error('❌ Error:', error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
