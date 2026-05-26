import { AxiosError } from 'axios';

/** Extract a human-readable message from an Axios/API error. */
export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message;
    if (Array.isArray(message)) return message.join(', ');
    if (typeof message === 'string') return message;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
