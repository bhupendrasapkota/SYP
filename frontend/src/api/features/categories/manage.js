import { categoriesService } from './service';
import { BaseManager } from '../base/BaseManager';

export class CategoriesManager extends BaseManager {
  constructor() {
    super();
    // Initialize caches
    this.categories = new Map(); // Cache categories by ID
    this.categoryPhotos = new Map(); // Cache photos by category ID
    this.categoryStats = new Map(); // Cache category statistics
    this.popularCategories = null; // Cache popular categories
    this.allCategories = null; // Cache all categories
  }

  async getAllCategories() {
    try {
      this.setLoading(true);
      
      if (this.allCategories) {
        return this.allCategories;
      }

      const data = await categoriesService.getAllCategories();
      this.allCategories = data;
      
      data.forEach(category => {
        this.categories.set(category.id, category);
      });
      
      return data;
    } catch (error) {
      this.setError(error);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  async getCategory(categoryId) {
    try {
      this.setLoading(true);
      
      if (this.categories.has(categoryId)) {
        return this.categories.get(categoryId);
      }

      const data = await categoriesService.getCategory(categoryId);
      this.categories.set(categoryId, data);
      
      return data;
    } catch (error) {
      this.setError(error);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  async createCategory(data) {
    try {
      this.setLoading(true);
      const category = await categoriesService.createCategory(data);
      
      this.categories.set(category.id, category);
      this.allCategories = null; // Clear all categories cache
      
      return category;
    } catch (error) {
      this.setError(error);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  async updateCategory(categoryId, data) {
    try {
      this.setLoading(true);
      const category = await categoriesService.updateCategory(categoryId, data);
      
      this.categories.set(categoryId, category);
      this.allCategories = null; // Clear all categories cache
      this.popularCategories = null; // Clear popular categories cache
      
      return category;
    } catch (error) {
      this.setError(error);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  async deleteCategory(categoryId) {
    try {
      this.setLoading(true);
      await categoriesService.deleteCategory(categoryId);
      
      this.categories.delete(categoryId);
      this.categoryPhotos.delete(categoryId);
      this.categoryStats.delete(categoryId);
      this.allCategories = null; // Clear all categories cache
      this.popularCategories = null; // Clear popular categories cache
    } catch (error) {
      this.setError(error);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  async addPhotos(categoryId, photoIds) {
    try {
      this.setLoading(true);
      const result = await categoriesService.addPhotos(categoryId, photoIds);
      
      this.updateCategoryPhotosCache(categoryId);
      this.updateCategoryStats(categoryId);
      
      return result;
    } catch (error) {
      this.setError(error);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  async removePhotos(categoryId, photoIds) {
    try {
      this.setLoading(true);
      await categoriesService.removePhotos(categoryId, photoIds);
      
      this.updateCategoryPhotosCache(categoryId);
      this.updateCategoryStats(categoryId);
    } catch (error) {
      this.setError(error);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  async getCategoryPhotos(categoryId, page = 1, pageSize = 10) {
    try {
      this.setLoading(true);
      const cacheKey = `${categoryId}-${page}-${pageSize}`;
      
      if (this.categoryPhotos.has(cacheKey)) {
        return this.categoryPhotos.get(cacheKey);
      }

      const data = await categoriesService.getCategoryPhotos(categoryId, page, pageSize);
      this.categoryPhotos.set(cacheKey, data);
      
      return data;
    } catch (error) {
      this.setError(error);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  async getPopular() {
    try {
      this.setLoading(true);
      
      if (this.popularCategories) {
        return this.popularCategories;
      }

      const data = await categoriesService.getPopular();
      this.popularCategories = data;
      
      data.forEach(category => {
        this.categories.set(category.id, category);
      });
      
      return data;
    } catch (error) {
      this.setError(error);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  async getStats(categoryId) {
    try {
      this.setLoading(true);
      
      if (this.categoryStats.has(categoryId)) {
        return this.categoryStats.get(categoryId);
      }

      const data = await categoriesService.getStats(categoryId);
      this.categoryStats.set(categoryId, data);
      
      return data;
    } catch (error) {
      this.setError(error);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  updateCategoryPhotosCache(categoryId) {
    for (const [key] of this.categoryPhotos) {
      if (key.startsWith(`${categoryId}-`)) {
        this.categoryPhotos.delete(key);
      }
    }
  }

  updateCategoryStats(categoryId) {
    this.categoryStats.delete(categoryId);
  }

  clearData() {
    super.clearData();
    this.categories.clear();
    this.categoryPhotos.clear();
    this.categoryStats.clear();
    this.popularCategories = null;
    this.allCategories = null;
  }
}

const categoryManager = new CategoriesManager();
export default categoryManager; 