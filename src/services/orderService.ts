import apiClient from '../api/client';
import type { Order, PaymentMethodType } from '../types';

export interface CreateOrderPayload {
  paymentMethod: PaymentMethodType;
  deliveryAddress: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    district?: string;
    postalCode?: string;
  };
}

export const createOrder = async (payload: CreateOrderPayload) => {
  const { data } = await apiClient.post('/orders', payload);
  return data;
};

export const getOrders = async (): Promise<Order[]> => {
  const { data } = await apiClient.get<Order[]>('/orders');
  return data;
};

export const getOrderById = async (id: string): Promise<Order> => {
  const { data } = await apiClient.get<Order>(`/orders/${id}`);
  return data;
};

export const cancelOrder = async (id: string, reason?: string) => {
  const { data } = await apiClient.put(`/orders/${id}/cancel`, { reason });
  return data;
};

export const deleteOrderFromHistory = async (id: string): Promise<{ message: string; orderId: string }> => {
  const { data } = await apiClient.delete<{ message: string; orderId: string }>(`/orders/${id}`);
  return data;
};
