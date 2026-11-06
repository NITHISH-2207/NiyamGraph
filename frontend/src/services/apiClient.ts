/**
 * Centralized Shared API Client
 * Configured with base URL from VITE_API_BASE_URL with graceful fallback.
 * Automatically injects Bearer JWT authorization token from active session.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

let inMemoryToken: string | null =
  localStorage.getItem('niyamgraph_jwt_token') ||
  sessionStorage.getItem('niyamgraph_jwt_token') ||
  null;

export const apiClient = {
  getBaseUrl(): string {
    return API_BASE_URL;
  },

  getToken(): string | null {
    if (!inMemoryToken) {
      inMemoryToken =
        localStorage.getItem('niyamgraph_jwt_token') ||
        sessionStorage.getItem('niyamgraph_jwt_token');
    }
    return inMemoryToken;
  },

  setToken(token: string) {
    inMemoryToken = token;
    localStorage.setItem('niyamgraph_jwt_token', token);
  },

  clearToken() {
    inMemoryToken = null;
    localStorage.removeItem('niyamgraph_jwt_token');
    sessionStorage.removeItem('niyamgraph_jwt_token');
  },

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, headers, ...customConfig } = options;

    let url = endpoint.startsWith('http')
      ? endpoint
      : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString;
      }
    }

    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    const token = this.getToken();
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...customConfig,
      headers: {
        ...defaultHeaders,
        ...(headers as Record<string, string>),
      },
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      let errorData: unknown;
      try {
        errorData = await response.json();
      } catch {
        errorData = await response.text();
      }

      if (response.status === 401) {
        window.dispatchEvent(new CustomEvent('niyamgraph:session-expired'));
      }

      throw new ApiError(
        `API request failed with status ${response.status}`,
        response.status,
        errorData
      );
    }

    if (response.status === 204) {
      return {} as T;
    }

    return (await response.json()) as T;
  },

  get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  },

  post<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  patch<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  put<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  },
};
