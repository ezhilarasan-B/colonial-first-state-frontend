/**
 * Centralized Authentication Configuration
 * Token storage keys, buffer times, and auth header definitions.
 */

export const AUTH_STORAGE_KEYS = {
  ACCESS_TOKEN: 'ud_access_token',
  REFRESH_TOKEN: 'ud_refresh_token',
} as const;

/**
 * Buffer time in seconds before actual expiration to trigger proactive refresh.
 * E.g., if token expires in 60 seconds, refresh it proactively before the API call.
 */
export const TOKEN_EXPIRY_BUFFER_SECONDS = 60;

export const AUTH_HEADER_PREFIX = 'Bearer ';

/**
 * Centralized Session & Authentication Messages
 */
export const SESSION_MESSAGES = {
  SESSION_EXPIRED_CLEARED: 'The session was expired or cleared. Please login again.',
} as const;

