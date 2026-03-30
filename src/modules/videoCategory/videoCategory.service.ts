import { VideoCategoryRepository } from './videoCategory.repository';
import { CreateVideoCategoryDto, UpdateVideoCategoryDto } from './videoCategory.schema';
import { ApiError } from '../../utils/ApiError';

export class VideoCategoryService {
  private repository: VideoCategoryRepository;

  constructor() {
    this.repository = new VideoCategoryRepository();
  }

  /**
   * Get all categories with videos
   */
  async getAll() {
    return this.repository.getAll();
  }

  /**
   * Get single category by ID
   */
  async getById(id: string) {
    const category = await this.repository.getById(id);

    if (!category) {
      throw new ApiError(404, 'الفصل غير موجود');
    }

    return category;
  }

  /**
   * Create new category
   */
  async create(data: CreateVideoCategoryDto) {
    return this.repository.create(data);
  }

  /**
   * Update category
   */
  async update(id: string, data: UpdateVideoCategoryDto) {
    // Check if category exists
    await this.getById(id);

    return this.repository.update(id, data);
  }

  /**
   * Delete category
   * Throws error if category has videos
   */
  async delete(id: string) {
    // Check if category exists
    const category = await this.getById(id);

    // Check if category has videos
    const videoCount = await this.repository.getVideoCount(id);

    if (videoCount > 0) {
      throw new ApiError(409, 'لا يمكن حذف الفصل — يحتوي على فيديوهات');
    }

    // Delete category
    await this.repository.delete(id);

    // Reorder remaining categories
    await this.repository.reorderAfterDelete(category.sortOrder);

    return { message: 'تم حذف الفصل بنجاح' };
  }
}
