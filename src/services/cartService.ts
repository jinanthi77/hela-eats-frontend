import apiClient from '../api/client';
import type { Cart } from '../types';

export const getCart = async (): Promise<Cart> => {
  const { data } = await apiClient.get<Cart>('/cart');
  return data;
};

export const addToCart = async (
  recipeId: string,
  servings: number = 1,
  excludedIngredients: string[] = [],
  isMealKit: boolean = false
) => {
  const { data } = await apiClient.post('/cart/add', { recipeId, servings, excludedIngredients, isMealKit });
  return data;
};

export const calculateScale = async (recipeId: string, servings: number, isMealKit: boolean = false) => {
  const { data } = await apiClient.post('/cart/calculate-scale', { recipeId, targetServings: servings, isMealKit });
  return data;
};

export const updateCartItem = async (itemId: string, servings: number) => {
  const { data } = await apiClient.put(`/cart/${itemId}`, { servings });
  return data;
};

export const removeCartItem = async (itemId: string) => {
  const { data } = await apiClient.delete(`/cart/${itemId}`);
  return data;
};

export const removeIngredientFromCartItem = async (itemId: string, ingredientId: string) => {
  const { data } = await apiClient.delete(`/cart/${itemId}/ingredients/${ingredientId}`);
  return data;
};

export const clearCart = async () => {
  const { data } = await apiClient.delete('/cart');
  return data;
};
