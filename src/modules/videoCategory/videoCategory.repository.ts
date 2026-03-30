import { PrismaClient, VideoCategory } from '@prisma/client';
import { prisma } from '../../config/database';
import { CreateVideoCategoryDto, UpdateVideoCategoryDto } from './videoCategory.schema';

export class VideoCategoryRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  /**
   * Get all categories ordered by sortOrder, with nested videos
   */
  async getAll() {
    return this.prisma.videoCategory.findMany({
      orderBy: {
        sortOrder: 'asc',
      },
      include: {
        videos: {
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
    });
  }

  /**
   * Get single category by ID with videos
   */
  async getById(id: string) {
    return this.prisma.videoCategory.findUnique({
      where: { id },
      include: {
        videos: {
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
    });
  }

  /**
   * Create new category
   */
  async create(data: CreateVideoCategoryDto): Promise<VideoCategory> {
    return this.prisma.videoCategory.create({
      data: {
        name: data.name,
        description: data.description,
        sortOrder: data.sortOrder ?? 0,
      },
    });
  }

  /**
   * Update category
   */
  async update(id: string, data: UpdateVideoCategoryDto): Promise<VideoCategory> {
    return this.prisma.videoCategory.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete category
   */
  async delete(id: string): Promise<VideoCategory> {
    return this.prisma.videoCategory.delete({
      where: { id },
    });
  }

  /**
   * Get count of videos in category
   */
  async getVideoCount(id: string): Promise<number> {
    return this.prisma.video.count({
      where: { categoryId: id },
    });
  }

  /**
   * Reorder categories after deletion
   * Decrements sortOrder of all categories above the deleted one
   */
  async reorderAfterDelete(deletedSortOrder: number): Promise<void> {
    await this.prisma.videoCategory.updateMany({
      where: {
        sortOrder: {
          gt: deletedSortOrder,
        },
      },
      data: {
        sortOrder: {
          decrement: 1,
        },
      },
    });
  }
}
