import apiClient from '../api/client';
import type { User, PantryItem, Address } from '../types';

export const getProfile = async (): Promise<User> => {
  const { data } = await apiClient.get<User>('/users/profile');
  return data;
};

export const updateProfile = async (payload: Partial<User>): Promise<User> => {
  const { data } = await apiClient.put<User>('/users/profile', payload);
  return data;
};

export const addToPantry = async (ingredientId: string): Promise<PantryItem[]> => {
  const { data } = await apiClient.post<PantryItem[]>('/users/pantry', { ingredientId });
  return data;
};

export const removeFromPantry = async (ingredientId: string): Promise<PantryItem[]> => {
  const { data } = await apiClient.delete<PantryItem[]>(`/users/pantry/${ingredientId}`);
  return data;
};

export const uploadProfilePicture = async (file: File): Promise<{ message: string; profilePicture: { url: string; publicId: string } }> => {
  const formData = new FormData();
  formData.append('profilePicture', file);
  const token = localStorage.getItem('token');
  const response = await fetch(`${apiClient.defaults.baseURL}/users/profile/picture`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Upload failed');
  }
  
  const data = await response.json();
  return data;
};

export const deleteProfilePicture = async (): Promise<{ message: string }> => {
  const { data } = await apiClient.delete('/users/profile/picture');
  return data;
};

export const addAddress = async (payload: {
  label?: string;
  fullName: string;
  phone?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district?: string;
  postalCode?: string;
  isDefault?: boolean;
}): Promise<{ message: string; addresses: Address[] }> => {
  const { data } = await apiClient.post<{ message: string; addresses: Address[] }>('/users/profile/addresses', payload);
  return data;
};
