import { Role, QuizCategory, QuizLevel } from '@prisma/client';

export interface SafeUser {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  role: Role;
  points: Number,
  academicNumber?: string | null;
  isVerified: boolean;
  createdAt: Date;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  fullName: string;
  academicNumber: string | null;
  points: number;
}

export interface CurrentUserRank {
  rank: number;
  points: number;
}

export interface QuizSessionSummary {
  sessionId: string;
  category: QuizCategory;
  level: QuizLevel;
  totalScore: number;
  correctCount: number;
  incorrectCount: number;
  completedAt: Date;
}

export interface DashboardStats {
  totalAccounts: number;
  totalStudents: number;
  totalParents: number;
  linkedStudents: number;
  registeredThisWeek: number;
  highestPoints: number;
  avgPoints: number;
  linkingRate: number;
}

export interface RegistrationChartData {
  date: string;
  students: number;
  parents: number;
}

export interface PointsDistribution {
  range: string;
  count: number;
}
