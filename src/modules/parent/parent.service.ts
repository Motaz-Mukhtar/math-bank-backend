import { ParentRepository } from './parent.repository';
import { LinkChildDto } from './parent.schema';
import { ApiError } from '../../utils/ApiError';
import { Role } from '@prisma/client';
import { LeaderboardRepository } from '../leaderboard/leaderboard.repository';

export class ParentService {
  private repository: ParentRepository;
  private leaderboardRepository: LeaderboardRepository;

  constructor() {
    this.repository = new ParentRepository();
    this.leaderboardRepository = new LeaderboardRepository();
  }

  /**
   * Link a child to parent account
   * Validates child is a STUDENT and no duplicate link exists
   */
  async linkChild(parentId: string, data: LinkChildDto) {
    // Find student by academic number
    const child = await this.repository.findUserByAcademicNumber(data.academicNumber);

    if (!child) throw new ApiError(404, 'الطالب غير موجود');

    // Validate child is a STUDENT
    if (child.role !== Role.STUDENT)
      throw new ApiError(400, 'يمكن ربط الطلاب فقط');

    // Check if link already exists
    const linkExists = await this.repository.linkExists(parentId, child.id);

    if (linkExists)
      throw new ApiError(400, 'الطالب مرتبط بالفعل بهذا الحساب');

    // Create link
    await this.repository.createLink(parentId, child.id);

    return {
      childId: child.id,
      fullName: child.fullName,
      email: child.email,
      academicNumber: child.academicNumber,
      message: 'تم ربط الطالب بنجاح',
    };
  }

  /**
   * Get all children linked to parent
   * Returns child info with points and rank
   */
  async getChildren(parentId: string) {
    const links = await this.repository.getLinksByParent(parentId);

    // Get rank for each child
    const childrenWithRank = await Promise.all(
      links.map(async (link: any) => {
        const rank = await this.repository.getChildRank(link.child.id);

        return {
          childId: link.child.id,
          fullName: link.child.fullName,
          email: link.child.email,
          academicNumber: link.child.academicNumber,
          points: link.child.points?.total || 0,
          rank,
          linkedAt: link.createdAt,
        };
      })
    );

    return childrenWithRank;
  }

  /**
   * Get child's progress details
   * Validates parent owns this child link
   * Returns child info + last 10 quiz sessions
   */
  async getChildProgress(parentId: string, childId: string) {
    // Verify parent-child link exists
    const link = await this.repository.getLink(parentId, childId);
    if (!link)
      throw new ApiError(403, 'ليس لديك صلاحية لعرض بيانات هذا الطالب');

    // Get child directly by ID using prisma from repository
    const childUser = await this.repository.prisma.user.findUnique({
      where: { id: childId },
      include: {
        points: true,
      },
    });

    if (!childUser)
      throw new ApiError(404, 'الطالب غير موجود');

    // Get child's rank
    const rank = await this.repository.getChildRank(childId);

    // Get quiz history and points history
    const [quizHistory, pointsHistory] = await Promise.all([
      this.repository.getChildQuizHistory(childId),
      this.leaderboardRepository.getUserPointsHistory(childId, 7),
    ]);

    // Format quiz history
    const formattedHistory = quizHistory.map((session: any) => {
      const correctCount = session.items.filter((item: any) => item.isCorrect).length;
      const incorrectCount = session.items.length - correctCount;

      return {
        sessionId: session.id,
        category: session.category,
        level: session.level,
        totalScore: session.totalScore,
        correctCount,
        incorrectCount,
        totalQuestions: session.items.length,
        completedAt: session.completedAt,
      };
    });

    return {
      child: {
        id: childUser.id,
        fullName: childUser.fullName,
        email: childUser.email,
        academicNumber: childUser.academicNumber,
        points: childUser.points?.total || 0,
        rank,
      },
      quizHistory: formattedHistory,
      pointsHistory,
    };
  }
}
