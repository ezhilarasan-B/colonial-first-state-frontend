/**
 * Axios Authentication Interceptors
 * Automatically injects Bearer JWT access tokens, validates expiry,
 * and performs stateless JWT refresh token rotation.
 * In live mode, requests communicate directly with .NET 8 Web API.
 */

import axios from 'axios';
import type {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from 'axios';
import {
  API_BASE_URL,
  API_ENDPOINTS,
  AUTH_HEADER_PREFIX,
  USE_MOCK_API,
  SESSION_MESSAGES,
} from '../../constants';
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
  isTokenExpired,
  isTokenAboutToExpire,
  isMockToken,
  createMockJwt,
} from './tokenHelper';
import type { RefreshTokenResponse } from './apiTypes';
import { store } from '../../app/store';
import { showToast } from '../../app/toastSlice';

export interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  _skipAuth?: boolean;
}

let refreshPromise: Promise<string> | null = null;

function notifySessionClearedAndRedirect(): void {
  sessionStorage.removeItem('cfs_session_cleared');
  clearTokens();
  const toastMsg = {
    message: SESSION_MESSAGES.SESSION_EXPIRED_CLEARED,
    type: 'warning' as const,
  };
  try {
    sessionStorage.setItem('cfs_pending_toast', JSON.stringify(toastMsg));
  } catch {
    // ignore
  }
  try {
    store.dispatch(showToast(toastMsg));
  } catch {
    // ignore
  }
  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
}

/**
 * Refreshes the JWT token using stateless JWT refresh token rotation.
 * Replaces the stored refresh token with the newly issued one.
 */
export async function refreshAuthToken(): Promise<string> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const currentRefreshToken = getRefreshToken();

      if (!currentRefreshToken) {
        clearTokens();
        throw new Error('No refresh token available');
      }

      // If switching from mock to live backend and token is mock, clear and fail
      if (!USE_MOCK_API && isMockToken(currentRefreshToken)) {
        clearTokens();
        throw new Error('Invalid mock token for live backend');
      }

      let newAccessToken: string;
      let newRefreshToken: string | undefined;

      if (USE_MOCK_API) {
        await new Promise((resolve) => setTimeout(resolve, 150));
        newAccessToken = createMockJwt(
          { name: 'CFS Staff Admin (Rotated)', token_type: 'access' },
          900
        );
        newRefreshToken = createMockJwt(
          { name: 'CFS Staff Admin (Rotated)', token_type: 'refresh' },
          7 * 86400
        );
      } else {
        const response = await axios.post<RefreshTokenResponse>(
          `${API_BASE_URL}${API_ENDPOINTS.REFRESH_TOKEN}`,
          { refreshToken: currentRefreshToken },
          { headers: { 'Content-Type': 'application/json' } }
        );
        newAccessToken = response.data.accessToken;
        newRefreshToken = response.data.refreshToken;
      }

      // Refresh token rotation: update stored access and refresh tokens
      setTokens(newAccessToken, newRefreshToken);
      return newAccessToken;
    } catch (error) {
      clearTokens();
      throw error;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export function setupAuthInterceptors(axiosInstance: AxiosInstance): void {
  // REQUEST INTERCEPTOR: Validate JWT expiry and inject Bearer token
  axiosInstance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      const customConfig = config as CustomAxiosRequestConfig;

      // Skip auth header for authentication endpoints
      if (customConfig._skipAuth || customConfig.url?.includes('/auth/')) {
        return customConfig;
      }

      // Check if session was explicitly cleared or user has no tokens
      const isSessionCleared = sessionStorage.getItem('cfs_session_cleared') === 'true';
      const hasAnyToken = Boolean(getAccessToken() || getRefreshToken());

      if (isSessionCleared || !hasAnyToken) {
        notifySessionClearedAndRedirect();
        return Promise.reject(new Error(SESSION_MESSAGES.SESSION_EXPIRED_CLEARED));
      }

      let token = getAccessToken();

      // If switching to live backend with an old mock token, clear it
      if (!USE_MOCK_API && isMockToken(token)) {
        clearTokens();
        token = null;
      }

      if (!token) {
        const refreshToken = getRefreshToken();
        if (refreshToken && !isTokenExpired(refreshToken)) {
          try {
            token = await refreshAuthToken();
          } catch {
            notifySessionClearedAndRedirect();
            return Promise.reject(new Error(SESSION_MESSAGES.SESSION_EXPIRED_CLEARED));
          }
        }
      } else if (isTokenAboutToExpire(token) || isTokenExpired(token)) {
        try {
          token = await refreshAuthToken();
        } catch (refreshErr) {
          console.warn('Proactive token refresh failed:', refreshErr);
        }
      }

      if (token) {
        customConfig.headers.Authorization = `${AUTH_HEADER_PREFIX}${token}`;
      }

      return customConfig;
    },
    (error) => Promise.reject(error)
  );

  // RESPONSE INTERCEPTOR: Catch 401, refresh token with rotation, retry request once
  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as CustomAxiosRequestConfig | undefined;

      if (!originalRequest) {
        return Promise.reject(error);
      }

      if (
        error.response?.status === 401 &&
        !originalRequest._retry &&
        !originalRequest.url?.includes('/auth/')
      ) {
        originalRequest._retry = true;

        try {
          const newAccessToken = await refreshAuthToken();
          originalRequest.headers.Authorization = `${AUTH_HEADER_PREFIX}${newAccessToken}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          notifySessionClearedAndRedirect();
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );
}
