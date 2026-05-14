import apiClient from '../api/client';
import type { VendorInventoryItem, RestockRequest, VendorOrder } from '../types';

// ─── Vendor-facing inventory endpoints ───────────────────────────────

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

export const deleteInventoryItem = async (id: string): Promise<{ message: string }> => {
  const { data } = await apiClient.delete<{ message: string }>(`/vendor/inventory/${id}`);
  return data;
};

// ─── Vendor order fulfillment (Gap 6) ────────────────────────────────

export const getVendorOrders = async (status?: string): Promise<VendorOrder[]> => {
  const params = status ? `?status=${status}` : '';
  const { data } = await apiClient.get<VendorOrder[]>(`/vendor/orders${params}`);
  return data;
};

// ─── Admin-facing inventory endpoints (Gaps 2, 10) ───────────────────

/** @deprecated Use getAllInventory('Approved') instead — GET /api/vendor is now admin-only */
export const getInventory = async (): Promise<VendorInventoryItem[]> => {
  const { data } = await apiClient.get<VendorInventoryItem[]>('/vendor');
  return data;
};

export const getVendors = async (): Promise<{ _id: string; name: string; email: string }[]> => {
  const { data } = await apiClient.get<{ _id: string; name: string; email: string }[]>('/vendor/vendors');
  return data;
};

export const getPendingInventory = async (): Promise<VendorInventoryItem[]> => {
  const { data } = await apiClient.get<VendorInventoryItem[]>('/vendor/inventory/pending');
  return data;
};

export const getAllInventory = async (status?: string): Promise<VendorInventoryItem[]> => {
  const params = status ? `?status=${status}` : '';
  const { data } = await apiClient.get<VendorInventoryItem[]>(`/vendor/inventory/all${params}`);
  return data;
};

export const reviewInventoryItem = async (id: string, payload: { status: 'Approved' | 'Rejected'; adminNotes?: string }): Promise<VendorInventoryItem> => {
  const { data } = await apiClient.put<VendorInventoryItem>(`/vendor/inventory/${id}/review`, payload);
  return data;
};

export const bulkReviewInventory = async (payload: { itemIds: string[]; status: 'Approved' | 'Rejected'; adminNotes?: string }): Promise<{ message: string; results: VendorInventoryItem[] }> => {
  const { data } = await apiClient.put<{ message: string; results: VendorInventoryItem[] }>('/vendor/inventory/bulk-review', payload);
  return data;
};

// ─── Recipe price sync (Gap 3) ───────────────────────────────────────

export const syncRecipePrices = async (recipeId: string): Promise<{ message: string; synced: number; failed: number; recipe: any }> => {
  const { data } = await apiClient.put<{ message: string; synced: number; failed: number; recipe: any }>(`/vendor/recipes/${recipeId}/sync-prices`);
  return data;
};

// ─── Restock requests ────────────────────────────────────────────────

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

