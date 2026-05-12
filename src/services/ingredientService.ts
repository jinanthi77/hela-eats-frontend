import apiClient from '../api/client';
import type { NutritionPer100Units } from '../types';

export interface Ingredient {
  _id: string;
  name: string;
  description?: string;
  baseUnit: string;
  isStaple?: boolean;
  createdBy?: string | null;
  nutritionPer100Units?: NutritionPer100Units;
}

export const getIngredients = async (): Promise<Ingredient[]> => {
  const { data } = await apiClient.get<Ingredient[]>('/ingredients');
  return data;
};

export const getIngredientById = async (id: string): Promise<Ingredient> => {
  const { data } = await apiClient.get<Ingredient>(`/ingredients/${id}`);
  return data;
};

export const createIngredient = async (payload: {
  name: string;
  baseUnit: string;
  description?: string;
  isStaple?: boolean;
  nutritionPer100Units?: NutritionPer100Units;
}): Promise<Ingredient> => {
  const { data } = await apiClient.post<Ingredient>('/ingredients', payload);
  return data;
};

export const updateIngredient = async (id: string, payload: {
  name?: string;
  baseUnit?: string;
  description?: string;
  isStaple?: boolean;
  nutritionPer100Units?: NutritionPer100Units;
}): Promise<Ingredient> => {
  const { data } = await apiClient.put<Ingredient>(`/ingredients/${id}`, payload);
  return data;
};

export const deleteIngredient = async (id: string): Promise<{ message: string }> => {
  const { data } = await apiClient.delete<{ message: string }>(`/ingredients/${id}`);
  return data;
};

