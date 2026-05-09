import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { ApiResponse } from '@/types';
import { tokenStorage } from './token.storage';

const API_URL = import.meta.env.VITE_API_URL || 'https://souqokaz.it.com';

// How many seconds before expiry to proactively refresh.
// 60s gives enough runway without being wasteful.
const PROACTIVE_REFRESH_BUFFER_SECONDS = 60;

interface RefreshResponse {
  credentials: {
    access_token:  string;
    refresh_token: string;
  };
  role: string;
}

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

// Module-level — guarantees only one refresh call in-flight across all requests.
let refreshPromise: Promise<string> | null = null;

// ─── JWT exp decoder (no library needed) ─────────────────────────────────────
//
// We only need the `exp` claim — no signature verification needed here because
// we're just deciding whether to refresh early. The server always verifies.
function getTokenExpiry(token: string): number | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const decoded = JSON.parse(atob(payload));
    return typeof decoded.exp == 'number' ? decoded.exp : null;
  } catch {
    return null;
  }
}

function isTokenExpiredOrExpiringSoon(token: string): boolean {
  const exp = getTokenExpiry(token);
  if (!exp) return true; // if we can't read it, treat as expired
  const nowSeconds = Math.floor(Date.now() / 1000);
  return nowSeconds >= exp - PROACTIVE_REFRESH_BUFFER_SECONDS;
}

// ─── ApiClient ────────────────────────────────────────────────────────────────

class ApiClient {
  private client: AxiosInstance;
  private onAuthFailure: (() => void) | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: { 'Content-Type': 'application/json' },
    });
    this.setupInterceptors();
  }

  setAuthFailureHandler(handler: () => void) {
    this.onAuthFailure = handler;
  }

  private setupInterceptors() {
    this.setupRequestInterceptor();
    this.setupResponseInterceptor();
  }

  // ── Request interceptor ───────────────────────────────────────────────────

  private setupRequestInterceptor() {
    this.client.interceptors.request.use(
      async (config: RetryableConfig) => {
        // Never touch requests that already have Authorization set
        if (config.headers.has('Authorization')) {
          return config;
        }
  
        const token     = tokenStorage.getAccess();
        const signature = tokenStorage.getSignature();
  
        if (!token || !signature) {
          return config;
        }
  
        // Proactive refresh — but ONLY if no refresh is already running.
        // If refreshPromise is non-null, another request already started it;
        // just wait for it rather than checking isTokenExpiredOrExpiringSoon again.
        if (isTokenExpiredOrExpiringSoon(token) && tokenStorage.getAccess()) {
          // refreshPromise being non-null means refresh is in-flight — attach to it.
          // refreshPromise being null means token is genuinely expiring and we start one.
          // Either way, getOrStartRefresh() handles both cases correctly.
          try {
            const freshToken = await this.getOrStartRefresh();
            // Re-read signature after refresh — it was preserved, but be explicit
            const currentSignature = tokenStorage.getSignature()!;
            config.headers.set('Authorization', `${currentSignature} ${freshToken}`);
            return config;
          } catch {
            // Refresh failed — let it go out with expired token, 401 handler takes over
          }
        }
  
        config.headers.set('Authorization', `${signature} ${token}`);
        return config;
      },
      (error) => Promise.reject(error),
    );
  }

  // ── Response interceptor ──────────────────────────────────────────────────

  private setupResponseInterceptor() {
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,

      async (error: AxiosError<ApiResponse>) => {
        const originalRequest = error.config as RetryableConfig | undefined;

        if (
          error.response?.status !== 401  ||
          !originalRequest               ||
          originalRequest._retry         ||
          originalRequest.url?.includes('/auth/refresh')
        ) {
          return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
          const newAccessToken = await this.getOrStartRefresh();

          // Signature is guaranteed to still be correct here — we never
          // overwrote it. getSignature() returns null only if clearAll()
          // was called, which only happens on auth failure (below).
          const signature = tokenStorage.getSignature();

          originalRequest.headers.set(
            'Authorization',
            `${signature} ${newAccessToken}`,
          );

          return this.client(originalRequest);

        } catch (refreshError) {
          tokenStorage.clearAll();
          this.onAuthFailure?.();
          return Promise.reject(refreshError);
        }
      },
    );
  }

  // ── Refresh orchestration ─────────────────────────────────────────────────

  private getOrStartRefresh(): Promise<string> {
    if (refreshPromise) return refreshPromise;

    // Assign synchronously before any await — prevents race condition where
    // multiple simultaneous 401s each see null and start their own refresh.
    refreshPromise = this.executeRefresh().finally(() => {
      refreshPromise = null;
    });

    return refreshPromise;
  }

  private async executeRefresh(): Promise<string> {
    const refreshToken = tokenStorage.getRefresh();
    const signature    = tokenStorage.getSignature();
  
    if (!refreshToken || !signature) {
      throw new Error('No refresh credentials available');
    }
  
    const response = await this.client.post<ApiResponse<RefreshResponse>>(
      '/auth/refresh',
      {},
      {
        headers: {
          Authorization: `${signature} ${refreshToken}`,
        },
      },
    );
  
    const data = response.data?.data;
  
    if (!data?.credentials?.access_token) {
      throw new Error('Refresh response missing access_token');
    }
  
    // Store new tokens — but DO NOT touch the signature.
    // The signature is determined at login and stays valid for the entire session.
    // Role cannot change mid-session; if it does, the user must re-login.
    tokenStorage.setCredentials(
      data.credentials.access_token,
      data.credentials.refresh_token,
    );
  
    // ❌ REMOVED: the role-based signature inference that was overwriting 'System' with 'Bearer'
  
    return data.credentials.access_token;
  }

  // ── Public HTTP methods ───────────────────────────────────────────────────

  get<T = any>(url: string, config?: any) {
    return this.client.get<ApiResponse<T>>(url, config);
  }
  post<T = any>(url: string, data?: any, config?: any) {
    return this.client.post<ApiResponse<T>>(url, data, config);
  }
  patch<T = any>(url: string, data?: any, config?: any) {
    return this.client.patch<ApiResponse<T>>(url, data, config);
  }
  delete<T = any>(url: string, config?: any) {
    return this.client.delete<ApiResponse<T>>(url, config);
  }
  postFormData<T = any>(url: string, formData: FormData, config?: any) {
    return this.client.post<ApiResponse<T>>(url, formData, {
      ...config,
      headers: { 'Content-Type': 'multipart/form-data', ...config?.headers },
    });
  }
  patchFormData<T = any>(url: string, formData: FormData, config?: any) {
    return this.client.patch<ApiResponse<T>>(url, formData, {
      ...config,
      headers: { 'Content-Type': 'multipart/form-data', ...config?.headers },
    });
  }
}

export const apiClient = new ApiClient();