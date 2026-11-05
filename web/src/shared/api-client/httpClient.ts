import type { AuthProvider } from '../services/contracts';
export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); this.name = 'ApiError'; }
}
/** Transport only; endpoint mappings and runtime response validation belong to adapters. */
export function createHttpClient(baseUrl: string, auth: AuthProvider, transport: typeof fetch = fetch) {
  return {
    async get(path: string, signal?: AbortSignal): Promise<unknown> {
      if (!path || path.startsWith('/') || path.includes('..') || /^[a-z]+:/i.test(path)) throw new Error('Expected a relative API endpoint');
      const token = await auth.getAccessToken();
      const response = await transport(`${baseUrl.replace(/\/$/, '')}/${path}`, {
        signal, credentials: 'same-origin', headers: { Accept: 'application/json', ...(token ? {Authorization: `Bearer ${token}`} : {}) },
      });
      if (!response.ok) throw new ApiError(response.status, `API request failed (${response.status})`);
      return response.json();
    },
  };
}
