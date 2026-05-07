import apiClient from '../api/client';
import type { MealPlan, MealPlanEntry } from '../types';

interface CreateMealPlanPayload {
  name: string;
  startDate: string;
  endDate: string;
  entries: (Omit<MealPlanEntry, 'recipe'> & { recipe: string })[];
}

export const getMealPlans = async (): Promise<MealPlan[]> => {
  const { data } = await apiClient.get<MealPlan[]>('/mealplans');
  return data;
};

export const getMealPlanById = async (id: string): Promise<MealPlan> => {
  const { data } = await apiClient.get<MealPlan>(`/mealplans/${id}`);
  return data;
};

export const createMealPlan = async (payload: CreateMealPlanPayload): Promise<MealPlan> => {
  const { data } = await apiClient.post<MealPlan>('/mealplans', payload);
  return data;
};

export const updateMealPlan = async (id: string, payload: Partial<CreateMealPlanPayload>): Promise<MealPlan> => {
  const { data } = await apiClient.put<MealPlan>(`/mealplans/${id}`, payload);
  return data;
};

export const deleteMealPlan = async (id: string) => {
  const { data } = await apiClient.delete(`/mealplans/${id}`);
  return data;
};

export const addMealPlanToCart = async (id: string) => {
  const { data } = await apiClient.post(`/mealplans/${id}/add-to-cart`);
  return data;
};
