import apiClient from '../api/client';
import type { Recipe } from '../types';

interface RecipeListResponse {
  recipes: Recipe[];
  pagination?: any;
}

interface RecipeFilters {
  search?: string;
  category?: string;
}

export const getRecipes = async (filters?: RecipeFilters): Promise<Recipe[]> => {
  const params = new URLSearchParams();
  if (filters?.search) params.append('search', filters.search);
  if (filters?.category) params.append('category', filters.category);

  const query = params.toString();
  const { data } = await apiClient.get<RecipeListResponse | Recipe[]>(`/recipes${query ? `?${query}` : ''}`);
  // Handle both { recipes: [...] } and direct array responses
  if (Array.isArray(data)) return data;
  return data.recipes || [];
};

export const getRecipeById = async (id: string): Promise<Recipe> => {
  const { data } = await apiClient.get<Recipe>(`/recipes/${id}`);
  return data;
};

export const getRecipeMealKit = async (id: string) => {
  const { data } = await apiClient.get(`/recipes/${id}/meal-kit`);
  return data;
};
