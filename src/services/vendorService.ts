import apiClient from '../api/client';
import type { VendorInventoryItem, RestockRequest } from '../types';

export const getInventory = async (): Promise<VendorInventoryItem[]> => {
  const { data } = await apiClient.get<VendorInventoryItem[]>('/vendor');
  return data;
};

export const getMyInventory = async (): Promise<VendorInventoryItem[]> => {
  const { data } = await apiClient.get<VendorInventoryItem[]>('/vendor/inventory/me');
  return data;
};

export const createInventoryItem = async (payload: { ingredientId: string, packageWeight: number, unit: string, price: number, stockQuantity: number, isReadyToCook: boolean }): Promise<VendorInventoryItem> => {
  const { data } = await apiClient.post<VendorInventoryItem>('/vendor/inventory', payload);
  return data;
};

export const updateInventoryItem = async (id: string, payload: Partial<VendorInventoryItem>): Promise<VendorInventoryItem> => {
  const { data } = await apiClient.put<VendorInventoryItem>(`/vendor/inventory/${id}`, payload);
  return data;
};

export const getRestockRequests = async (): Promise<RestockRequest[]> => {
  const { data } = await apiClient.get<RestockRequest[]>('/vendor/requests');
  return data;
};

export const createRestockRequest = async (payload: { vendorId: string, items: any[], notes?: string }): Promise<RestockRequest> => {
  const { data } = await apiClient.post<RestockRequest>('/vendor/requests', payload);
  return data;
};

export const updateRequestStatus = async (id: string, status: string): Promise<RestockRequest> => {
  const { data } = await apiClient.put<RestockRequest>(`/vendor/requests/${id}/status`, { status });
  return data;
};
