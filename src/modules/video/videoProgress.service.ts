import { prisma } from '../../config/database';
import { ApiError } from '../../utils/ApiError';
import type { UpdateProgressInput } from './videoProgress.schema';

export class VideoProgressService {
  /**
   * Update or create video progress for a user
   * Marks as completed if progress >= 90%
   */
  async updateProgress(userId: string, videoId: string, data: UpdateProgressInput) {
    // Verify video exists
    const video = await prisma.video.findUnique({
      where: { id: videoId },
    });

    if (!video) {
      throw new ApiError(404, 'الفيديو غير موجود');
    }

    // Calculate if completed (90% threshold)
    const isCompleted = data.progressPercent >= 90;
    const now = new Date();

    // Upsert progress
    const progress = await prisma.videoProgress.upsert({
      where: {
        userId_videoId: {
          userId,
          videoId,
        },
      },
      update: {
        watchedDuration: data.watchedDuration,
        totalDuration: data.totalDuration,
        progressPercent: data.progressPercent,
        isCompleted: isCompleted || undefined, // Only update if true (don't revert)
        completedAt: isCompleted ? now : undefined,
        lastWatchedAt: now,
      },
      create: {
        userId,
        videoId,
        watchedDuration: data.watchedDuration,
        totalDuration: data.totalDuration,
        progressPercent: data.progressPercent,
        isCompleted,
        completedAt: isCompleted ? now : null,
        lastWatchedAt: now,
      },
      include: {
        video: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return progress;
  }

  /**
   * Get user's progress for a specific video
   */
  async getProgress(userId: string, videoId: string) {
    const progress = await prisma.videoProgress.findUnique({
      where: {
        userId_videoId: {
          userId,
          videoId,
        },
      },
      include: {
        video: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return progress;
  }

  /**
   * Get all video progress for a user
   * Optionally filter by category
   */
  async getUserProgress(userId: string, categoryId?: string) {
    const progress = await prisma.videoProgress.findMany({
      where: {
        userId,
        ...(categoryId && {
          video: {
            categoryId,
          },
        }),
      },
      include: {
        video: {
          select: {
            id: true,
            title: true,
            categoryId: true,
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        lastWatchedAt: 'desc',
      },
    });

    return progress;
  }

  /**
   * Get progress statistics for a user
   */
  async getProgressStats(userId: string) {
    const [totalVideos, completedVideos, inProgressVideos, totalWatchTime] = await Promise.all([
      // Total videos available
      prisma.video.count(),
      
      // Completed videos
      prisma.videoProgress.count({
        where: {
          userId,
          isCompleted: true,
        },
      }),
      
      // In progress videos (started but not completed)
      prisma.videoProgress.count({
        where: {
          userId,
          isCompleted: false,
          progressPercent: {
            gt: 0,
          },
        },
      }),
      
      // Total watch time in seconds
      prisma.videoProgress.aggregate({
        where: {
          userId,
        },
        _sum: {
          watchedDuration: true,
        },
      }),
    ]);

    return {
      totalVideos,
      completedVideos,
      inProgressVideos,
      notStartedVideos: totalVideos - completedVideos - inProgressVideos,
      completionRate: totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0,
      totalWatchTimeSeconds: totalWatchTime._sum.watchedDuration || 0,
      totalWatchTimeMinutes: Math.round((totalWatchTime._sum.watchedDuration || 0) / 60),
    };
  }

  /**
   * Get recently watched videos for a user
   */
  async getRecentlyWatched(userId: string, limit: number = 10) {
    const progress = await prisma.videoProgress.findMany({
      where: {
        userId,
      },
      include: {
        video: {
          select: {
            id: true,
            title: true,
            description: true,
            url: true,
            categoryId: true,
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        lastWatchedAt: 'desc',
      },
      take: limit,
    });

    return progress;
  }
}
