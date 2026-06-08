export function getApiErrorMessage(err: unknown, fallback: string): string {
  const axiosErr = err as { response?: { status?: number; data?: { message?: string | string[] } } };
  const raw = axiosErr.response?.data?.message;
  const message = Array.isArray(raw) ? raw[0] : raw;

  if (
    axiosErr.response?.status === 429 ||
    (typeof message === 'string' && /throttler|too many requests/i.test(message))
  ) {
    return 'Too many attempts. Please wait a minute and try again.';
  }

  if (typeof message === 'string' && message.trim()) {
    return message;
  }

  return fallback;
}
