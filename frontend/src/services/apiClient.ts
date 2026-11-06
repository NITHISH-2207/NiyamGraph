/**
 * Centralized Shared API Client
 * Configured with dynamic base URL resolution across local and deployed environments.
 * Strictly adheres to project specification:
 * - Supports VITE_API_URL and VITE_API_BASE_URL.
 * - In local dev, defaults to http://localhost:8000/api/v1.
 * - In production builds, defaults to relative /api/v1 (never falls back to localhost).
 */

export function resolveApiBaseUrl(): string {
  const envUrl = (
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    ''
  ).trim();

  if (envUrl) {
    let url = envUrl.replace(/\/+$/, '');
    if (url.endsWith('/api')) {
      return `${url}/v1`;
    }
    if (!url.endsWith('/api/v1')) {
      return `${url}/api/v1`;
    }
    return url;
  }

  // Local development fallback
  if (import.meta.env.DEV) {
    return 'http://localhost:8000/api/v1';
  }

  // Production fallback: same-origin relative path (prevents loopback CORS block)
  return '/api/v1';
}

const API_BASE_URL = resolveApiBaseUrl();

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

    let cleanEndpoint = endpoint;
    if (cleanEndpoint.startsWith('/api/v1')) {
      cleanEndpoint = cleanEndpoint.substring('/api/v1'.length);
    }

    let url = endpoint.startsWith('http')
      ? endpoint
      : `${API_BASE_URL}${cleanEndpoint.startsWith('/') ? '' : '/'}${cleanEndpoint}`;

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

    // Try reading active token from persisted auth session
    let token = '';
    try {
      const sessionData = localStorage.getItem('niyamgraph_auth_session');
      if (sessionData) {
        const parsed = JSON.parse(sessionData);
        if (parsed?.token) {
          token = parsed.token;
        }
      }
    } catch {
      // LocalStorage access failure fallback
    }

    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

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
