import { VideoCategoryRepository } from './videoCategory.repository';
import { CreateVideoCategoryDto, UpdateVideoCategoryDto } from './videoCategory.schema';
import { ApiError } from '../../utils/ApiError';

export class VideoCategoryService {
  private repository: VideoCategoryRepository;

  constructor() {
    this.repository = new VideoCategoryRepository();
  }

  /**
   * Get all categories with videos and pagination
   */
  async getAll(page: number = 1, limit: number = 10, search?: string) {
    const skip = (page - 1) * limit;
    
    const [categories, total] = await Promise.all([
      this.repository.getAll(skip, limit, search),
      this.repository.count(search),
    ]);

    return {
      categories,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get all categories without pagination (for dropdowns)
   */
  async getAllNoPagination() {
    const categories = await this.repository.getAllNoPagination();
    return { categories };
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

  /**
   * Get all categories with their videos (no pagination)
   * Returns data formatted for displaying videos grouped by category
   */
  async getVideosWithCategories() {
    const categories = await this.repository.getAllWithVideos();

    return categories;
  }
}
