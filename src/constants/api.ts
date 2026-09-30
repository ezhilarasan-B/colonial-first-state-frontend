/**
 * Centralized API Configuration & Endpoints
 * All API-related constants must be defined here and reused across the application.
 */

/**
 * API version - update this single constant to change the version across all endpoints.
 */
export const API_VERSION = 'v1';

export const API_BASE_URL: string =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
  `http://localhost:5200/api/${API_VERSION}`;

export const API_TIMEOUT_MS = 15000;

export const API_ENDPOINTS = {
  STAFF: '/staff',
  STAFF_ALL: '/staff/all',
  STAFF_BY_ID: (id: string | number) => `/staff/${id}`,
  STAFF_BULK_DELETE: '/staff/bulk-delete',
  CLIENT: '/client',
  CLIENT_BY_ID: (id: string | number) => `/client/${id}`,
  CLIENT_BULK_DELETE: '/client/bulk-delete',
  AUTH_USERS: '/authusers',
  AUTH_USER_BY_ID: (id: string | number) => `/authusers/${id}`,
  LOGIN: '/auth/login',
  REFRESH_TOKEN: '/auth/refresh-token',
} as const;

export const USE_MOCK_API: boolean =
  import.meta.env.VITE_USE_MOCK_API !== 'false';
