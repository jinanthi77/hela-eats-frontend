import apiClient from '../api/client';

export interface Ingredient {
  _id: string;
  name: string;
  description?: string;
  baseUnit: string;
  isStaple?: boolean;
}

export const getIngredients = async (): Promise<Ingredient[]> => {
  const { data } = await apiClient.get<Ingredient[]>('/ingredients');
  return data;
};

export const createIngredient = async (payload: {
  name: string;
  baseUnit: string;
  description?: string;
  isStaple?: boolean;
}): Promise<Ingredient> => {
  const { data } = await apiClient.post<Ingredient>('/ingredients', payload);
  return data;
};
