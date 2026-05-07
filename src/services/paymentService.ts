import apiClient from '../api/client';

interface InitiatePaymentResponse {
  message: string;
  payment: {
    _id: string;
    transactionId: string;
    method: string;
    amount: number;
    currency: string;
    status: string;
  };
  stripeCheckoutUrl?: string;  // For card payments — redirect URL
  stripeSessionId?: string;
}

export const initiatePayment = async (
  orderId: string
): Promise<InitiatePaymentResponse> => {
  const { data } = await apiClient.post<InitiatePaymentResponse>('/payments/initiate', {
    orderId,
  });
  return data;
};

export const verifyPayment = async (sessionId: string) => {
  const { data } = await apiClient.get(`/payments/verify/${sessionId}`);
  return data;
};

export const getPaymentForOrder = async (orderId: string) => {
  const { data } = await apiClient.get(`/payments/order/${orderId}`);
  return data;
};
