import { VideoRepository } from './video.repository';
import { VideoCategoryRepository } from '../videoCategory/videoCategory.repository';
import { CreateVideoDto, UpdateVideoDto, MoveVideoDto } from './video.schema';
import { ApiError } from '../../utils/ApiError';

export class VideoService {
  private repository: VideoRepository;
  private categoryRepository: VideoCategoryRepository;

  constructor() {
    this.repository = new VideoRepository();
    this.categoryRepository = new VideoCategoryRepository();
  }

  /**
   * Get all videos with optional filters
   */
  async getAll(filters?: { categoryId?: string }) {
    // If categoryId provided, verify it exists
    if (filters?.categoryId) {
      const category = await this.categoryRepository.getById(filters.categoryId);
      if (!category) {
        throw new ApiError(404, 'الفصل غير موجود');
      }
    }

    return this.repository.getAll(filters);
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

    return this.repository.create(data);
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

    return this.repository.update(id, data);
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

    return this.repository.moveToCategory(id, data.categoryId);
  }
}
