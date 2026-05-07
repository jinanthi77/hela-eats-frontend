import apiClient from '../api/client';
import type { Category, Order, Recipe } from '../types';

// ─── Admin Category CRUD ─────────────────────────────────────────────

export interface CreateCategoryPayload {
  name: string;
  description?: string;
  imageUrl?: string;
  displayOrder?: number;
}

export interface UpdateCategoryPayload {
  name?: string;
  description?: string;
  imageUrl?: string;
  displayOrder?: number;
  isActive?: boolean;
}

/** Returns ALL categories including inactive ones (admin only) */
export const adminGetAllCategories = async (): Promise<(Category & { isActive?: boolean; displayOrder?: number; recipeCount?: number })[]> => {
  const { data } = await apiClient.get('/categories/admin/all');
  return Array.isArray(data) ? data : [];
};

export const adminCreateCategory = async (payload: CreateCategoryPayload): Promise<Category> => {
  const { data } = await apiClient.post<Category>('/categories', payload);
  return data;
};

export const adminUpdateCategory = async (id: string, payload: UpdateCategoryPayload): Promise<Category> => {
  const { data } = await apiClient.put<Category>(`/categories/manage/${id}`, payload);
  return data;
};

export const adminDeleteCategory = async (id: string) => {
  const { data } = await apiClient.delete(`/categories/manage/${id}`);
  return data;
};

// ─── Admin Recipe CRUD ───────────────────────────────────────────────

export interface RecipePayload {
  title: string;
  description?: string;
  category?: string;
  imageUrl?: string;
  prepTime?: number;
  cookTime?: number;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  tags?: string[];
  standardServingSize?: number;
  ingredients?: { ingredientId: string; exactQuantity: number; unit: string }[];
  steps?: { stepNumber: number; instruction: string }[];
  nutritionPerStandardServing?: { calories: number; protein: number; carbs: number; fat: number };
}

export const adminCreateRecipe = async (payload: RecipePayload): Promise<Recipe> => {
  const { data } = await apiClient.post<Recipe>('/recipes', payload);
  return data;
};

export const adminUpdateRecipe = async (id: string, payload: Partial<RecipePayload>): Promise<Recipe> => {
  const { data } = await apiClient.put<Recipe>(`/recipes/${id}`, payload);
  return data;
};

export const adminDeleteRecipe = async (id: string) => {
  const { data } = await apiClient.delete(`/recipes/${id}`);
  return data;
};

// ─── Admin Order Management ──────────────────────────────────────────

export const adminGetAllOrders = async (): Promise<Order[]> => {
  const { data } = await apiClient.get<Order[]>('/orders/admin/all');
  return data;
};

export const adminUpdateOrderStatus = async (
  id: string,
  status: string,
  note?: string
): Promise<any> => {
  const { data } = await apiClient.put(`/orders/${id}/status`, { status, note });
  return data;
};
