/**
 * Script to populate test data for weekly leaderboard testing
 * Run with: npx ts-node src/scripts/populate-weekly-test-data.ts
 * 
 * WARNING: This creates test quiz sessions. Use only in development!
 */

import { PrismaClient, QuizCategory } from '@prisma/client';

const prisma = new PrismaClient();

function getWeekStart(): Date {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysSinceSaturday = (dayOfWeek + 1) % 7;
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - daysSinceSaturday);
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
}

async function populateWeeklyTestData() {
  console.log('🎯 Populating Weekly Leaderboard Test Data\n');
  console.log('═'.repeat(60));

  const weekStart = getWeekStart();
  console.log(`📅 Week Start: ${weekStart.toISOString()}`);
  console.log('═'.repeat(60));
  console.log();

  // Get all verified students
  const students = await prisma.user.findMany({
    where: { role: 'STUDENT', isVerified: true },
    select: { id: true, fullName: true, academicNumber: true },
  });

  if (students.length === 0) {
    console.log('❌ No verified students found. Please create student accounts first.');
    return;
  }

  console.log(`👥 Found ${students.length} verified students`);
  console.log();

  const categories: QuizCategory[] = [
    'ADDITION',
    'SUBTRACTION',
    'MULTIPLICATION',
    'DIVISION',
  ];

  let totalSessionsCreated = 0;

  // Create 1-3 quiz sessions for each student this week
  for (const student of students) {
    const numSessions = Math.floor(Math.random() * 3) + 1; // 1-3 sessions
    
    console.log(`📝 Creating ${numSessions} sessions for ${student.fullName}...`);

    for (let i = 0; i < numSessions; i++) {
      // Random date this week
      const daysOffset = Math.floor(Math.random() * 7);
      const sessionDate = new Date(weekStart);
      sessionDate.setDate(weekStart.getDate() + daysOffset);
      sessionDate.setHours(
        Math.floor(Math.random() * 24),
        Math.floor(Math.random() * 60),
        0,
        0
      );

      // Random category
      const category = categories[Math.floor(Math.random() * categories.length)];

      // Create quiz session
      const session = await prisma.quizSession.create({
        data: {
          userId: student.id,
          category,
          level: 'MEDIUM',
          createdAt: sessionDate,
        },
      });

      // Create 10 quiz items with random points
      const items = [];
      for (let q = 0; q < 10; q++) {
        const isCorrect = Math.random() > 0.3; // 70% correct rate
        const pointsEarned = isCorrect ? Math.floor(Math.random() * 10) + 5 : 0; // 5-15 points if correct

        items.push({
          sessionId: session.id,
          questionId: `test-question-${q}`,
          userAnswer: isCorrect ? 'correct' : 'wrong',
          isCorrect,
          pointsEarned,
          timeSpent: Math.floor(Math.random() * 30) + 10, // 10-40 seconds
        });
      }

      await prisma.quizSessionItem.createMany({ data: items });

      const totalPoints = items.reduce((sum, item) => sum + item.pointsEarned, 0);
      console.log(`  ✅ Session ${i + 1}: ${totalPoints} points on ${sessionDate.toLocaleDateString()}`);
      
      totalSessionsCreated++;
    }
    console.log();
  }

  console.log('═'.repeat(60));
  console.log(`✅ Created ${totalSessionsCreated} test quiz sessions`);
  console.log();

  // Show preview of weekly leaderboard
  console.log('🏆 Weekly Leaderboard Preview:');
  console.log('═'.repeat(60));

  const quizPoints = await prisma.quizSessionItem.groupBy({
    by: ['sessionId'],
    _sum: { pointsEarned: true },
    where: { session: { createdAt: { gte: weekStart } } },
  });

  const sessionIds = quizPoints.map((r: any) => r.sessionId);
  const sessions = await prisma.quizSession.findMany({
    where: { id: { in: sessionIds } },
    select: { id: true, userId: true },
  });

  const userPoints = new Map<string, number>();
  for (const row of quizPoints) {
    const session = sessions.find((s: any) => s.id === row.sessionId);
    if (!session) continue;
    userPoints.set(session.userId, (userPoints.get(session.userId) || 0) + (row._sum.pointsEarned || 0));
  }

  const userIds = Array.from(userPoints.keys());
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, fullName: true, academicNumber: true },
  });

  const leaderboard = users
    .map((u: any) => ({ ...u, points: userPoints.get(u.id) || 0 }))
    .sort((a: any, b: any) => b.points - a.points);

  leaderboard.forEach((user, i) => {
    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '  ';
    console.log(`${medal} ${i + 1}. ${user.fullName} (${user.academicNumber || 'N/A'}) - ${user.points} points`);
  });

  console.log();
  console.log('═'.repeat(60));
  console.log('✅ Test data populated successfully!');
  console.log();
  console.log('💡 Next Steps:');
  console.log('   1. Open the leaderboard page in your browser');
  console.log('   2. Click "هذا الأسبوع" (This Week) button');
  console.log('   3. You should now see the test data');
  console.log();
}

populateWeeklyTestData()
  .catch((error) => {
    console.error('❌ Error:', error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
