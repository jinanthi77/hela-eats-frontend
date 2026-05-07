import apiClient from '../api/client';
import type { Category } from '../types';

interface CategoryListResponse {
  data?: Category[];
}

export const getCategories = async (): Promise<Category[]> => {
  const { data } = await apiClient.get<CategoryListResponse | Category[]>('/categories');
  // Handle both { data: [...] } and direct array responses
  return Array.isArray(data) ? data : (data.data || []);
};

export const getCategoryBySlug = async (slug: string) => {
  const { data } = await apiClient.get(`/categories/${slug}`);
  return data;
};
