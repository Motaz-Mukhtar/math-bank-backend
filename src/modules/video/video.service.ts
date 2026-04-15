import { VideoRepository } from './video.repository';
import { VideoCategoryRepository } from '../videoCategory/videoCategory.repository';
import { CreateVideoDto, UpdateVideoDto, MoveVideoDto } from './video.schema';
import { ApiError } from '../../utils/ApiError';
import { cacheService } from '../../services/cache.service';
import { CachePatterns } from '../../constants';

export class VideoService {
  private repository: VideoRepository;
  private categoryRepository: VideoCategoryRepository;

  constructor() {
    this.repository = new VideoRepository();
    this.categoryRepository = new VideoCategoryRepository();
  }

  /**
   * Get all videos with optional filters and pagination
   */
  async getAll(filters?: { categoryId?: string; search?: string }, page: number = 1, limit: number = 10) {
    // If categoryId provided, verify it exists
    if (filters?.categoryId) {
      const category = await this.categoryRepository.getById(filters.categoryId);
      if (!category) {
        throw new ApiError(404, 'الفصل غير موجود');
      }
    }

    const skip = (page - 1) * limit;
    
    const [videos, total] = await Promise.all([
      this.repository.getAll(filters, skip, limit),
      this.repository.count(filters),
    ]);

    return {
      videos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get single video by ID
   */
  async getById(id: string) {
    const video = await this.repository.getById(id);

    if (!video) {
      throw new ApiError(404, 'الفيديو غير موجود');
    }

    return video;
  }

  /**
   * Create new video
   */
  async create(data: CreateVideoDto) {
    // Verify category exists
    const category = await this.categoryRepository.getById(data.categoryId);
    if (!category) {
      throw new ApiError(404, 'الفصل غير موجود');
    }

    const result = await this.repository.create(data);

    // Invalidate video cache
    cacheService.delPattern(CachePatterns.VIDEO);
    console.log('🔄 Cache invalidated: videos (video created)');

    return result;
  }

  /**
   * Update video
   */
  async update(id: string, data: UpdateVideoDto) {
    // Check if video exists
    await this.getById(id);

    // If categoryId is being updated, verify new category exists
    if (data.categoryId) {
      const category = await this.categoryRepository.getById(data.categoryId);
      if (!category) {
        throw new ApiError(404, 'الفصل الجديد غير موجود');
      }
    }

    const result = await this.repository.update(id, data);

    // Invalidate video cache
    cacheService.delPattern(CachePatterns.VIDEO);
    console.log('🔄 Cache invalidated: videos (video updated)');

    return result;
  }

  /**
   * Delete video
   */
  async delete(id: string) {
    // Check if video exists
    const video = await this.getById(id);

    // Delete video
    await this.repository.delete(id);

    // Reorder remaining videos in the same category
    await this.repository.reorderAfterDelete(video.categoryId, video.sortOrder);

    // Invalidate video cache
    cacheService.delPattern(CachePatterns.VIDEO);
    console.log('🔄 Cache invalidated: videos (video deleted)');

    return { message: 'تم حذف الفيديو بنجاح' };
  }

  /**
   * Move video to different category
   */
  async moveToCategory(id: string, data: MoveVideoDto) {
    // Check if video exists
    await this.getById(id);

    // Verify new category exists
    const category = await this.categoryRepository.getById(data.categoryId);
    if (!category) {
      throw new ApiError(404, 'الفصل الجديد غير موجود');
    }

    const result = await this.repository.moveToCategory(id, data.categoryId);

    // Invalidate video cache
    cacheService.delPattern(CachePatterns.VIDEO);
    console.log('🔄 Cache invalidated: videos (video moved)');

    return result;
  }
}
