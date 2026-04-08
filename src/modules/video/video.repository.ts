import { PrismaClient, Video } from '@prisma/client';
import { prisma } from '../../config/database';
import { CreateVideoDto, UpdateVideoDto } from './video.schema';

interface GetAllFilters {
  categoryId?: string;
  search?: string;
}

export class VideoRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  /**
   * Get all videos with optional filters and pagination
   */
  async getAll(filters?: GetAllFilters, skip: number = 0, take: number = 10) {
    const where: any = {};

    if (filters?.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.video.findMany({
      where,
      orderBy: {
        sortOrder: 'asc',
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      skip,
      take,
    });
  }

  /**
   * Count videos with optional filters
   */
  async count(filters?: GetAllFilters) {
    const where: any = {};

    if (filters?.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.video.count({ where });
  }

  /**
   * Get single video by ID
   */
  async getById(id: string) {
    return this.prisma.video.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Create new video
   */
  async create(data: CreateVideoDto): Promise<Video> {
    return this.prisma.video.create({
      data: {
        title: data.title,
        description: data.description,
        url: data.url,
        categoryId: data.categoryId,
        sortOrder: data.sortOrder ?? 0,
      },
    });
  }

  /**
   * Update video
   */
  async update(id: string, data: UpdateVideoDto): Promise<Video> {
    return this.prisma.video.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete video
   */
  async delete(id: string): Promise<Video> {
    return this.prisma.video.delete({
      where: { id },
    });
  }

  /**
   * Move video to different category
   */
  async moveToCategory(id: string, newCategoryId: string): Promise<Video> {
    return this.prisma.video.update({
      where: { id },
      data: {
        categoryId: newCategoryId,
      },
    });
  }

  /**
   * Reorder videos after deletion
   */
  async reorderAfterDelete(categoryId: string, deletedSortOrder: number): Promise<void> {
    await this.prisma.video.updateMany({
      where: {
        categoryId,
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
