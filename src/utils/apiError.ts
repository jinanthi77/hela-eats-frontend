export const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error !== 'object' || error === null || !('response' in error)) {
    return error instanceof Error && error.message ? error.message : fallback;
  }

  const response = (error as { response?: { data?: { message?: unknown } } }).response;
  if (typeof response?.data?.message === 'string') return response.data.message;

  return error instanceof Error && error.message ? error.message : fallback;
};
