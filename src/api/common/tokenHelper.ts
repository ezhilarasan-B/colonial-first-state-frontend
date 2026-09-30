/**
 * Token Helper
 * Dedicated centralized service for managing JWT tokens, decoding payloads,
 * checking expiry states, and reading/writing to storage.
 * Implements JWT refresh tokens with rotation.
 */

import {
  AUTH_STORAGE_KEYS,
  TOKEN_EXPIRY_BUFFER_SECONDS,
} from '../../constants/auth';
import { USE_MOCK_API } from '../../constants/api';
import type { TokenPayload } from './apiTypes';

function base64UrlDecode(str: string): string {
  let output = str.replace(/-/g, '+').replace(/_/g, '/');
  switch (output.length % 4) {
    case 0:
      break;
    case 2:
      output += '==';
      break;
    case 3:
      output += '=';
      break;
    default:
      throw new Error('Illegal base64url string');
  }
  return decodeURIComponent(
    atob(output)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
}

export function decodeJwt(token: string): TokenPayload | null {
  if (!token || typeof token !== 'string') {
    return null;
  }
  try {
    const parts = token.split('.');
    if (parts.length < 2) {
      return null;
    }
    const decoded = base64UrlDecode(parts[1]);
    return JSON.parse(decoded) as TokenPayload;
  } catch {
    return null;
  }
}

export function getAccessToken(): string | null {
  try {
    return localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  } catch {
    return null;
  }
}

export function getRefreshToken(): string | null {
  try {
    return localStorage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
  } catch {
    return null;
  }
}

export function setTokens(accessToken: string, refreshToken?: string): void {
  try {
    localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    if (refreshToken) {
      localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    }
  } catch (error) {
    console.error('Failed to store authentication tokens:', error);
  }
}

export function clearTokens(): void {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
  } catch (error) {
    console.error('Failed to clear authentication tokens:', error);
  }
}

export function isTokenExpired(token: string | null): boolean {
  if (!token) return true;
  const payload = decodeJwt(token);
  if (!payload || !payload.exp) return true;

  const currentTimeSeconds = Math.floor(Date.now() / 1000);
  return payload.exp <= currentTimeSeconds;
}

export function isTokenAboutToExpire(
  token: string | null,
  bufferSeconds: number = TOKEN_EXPIRY_BUFFER_SECONDS
): boolean {
  if (!token) return true;
  const payload = decodeJwt(token);
  if (!payload || !payload.exp) return true;

  const currentTimeSeconds = Math.floor(Date.now() / 1000);
  return payload.exp - currentTimeSeconds <= bufferSeconds;
}

export function isMockToken(token: string | null): boolean {
  if (!token) return false;
  return token.includes('mock_signature_colonial_first_state');
}

/**
 * Checks whether a valid session or refreshable token exists.
 * Returns true if valid, false if completely unauthenticated or expired without refresh.
 */
export function hasValidSession(): boolean {
  const token = getAccessToken();
  const refreshToken = getRefreshToken();

  if (!token && !refreshToken) {
    return false;
  }

  // In live backend mode, reject mock tokens
  if (!USE_MOCK_API && (isMockToken(token) || isMockToken(refreshToken))) {
    clearTokens();
    return false;
  }

  // If access token is valid, authenticated
  if (token && !isTokenExpired(token)) {
    return true;
  }

  // If access token expired but refresh token valid, session can be restored
  if (refreshToken && !isTokenExpired(refreshToken)) {
    return true;
  }

  return false;
}

/**
 * Creates a valid JWT format mock token with signature for mock & testing mode.
 */
export function createMockJwt(
  payload: Partial<TokenPayload>,
  expiresInSeconds: number = 3600
): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: TokenPayload = {
    sub: '1',
    name: 'Administrator',
    email: 'admin@cfs.local',
    token_type: 'access',
    jti: 'jti-' + Math.random().toString(36).substring(2),
    iat: now,
    exp: now + expiresInSeconds,
    ...payload,
  };

  const toBase64Url = (obj: object) =>
    btoa(JSON.stringify(obj))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

  const encodedHeader = toBase64Url(header);
  const encodedPayload = toBase64Url(fullPayload);
  const mockSignature = 'mock_signature_colonial_first_state';

  return `${encodedHeader}.${encodedPayload}.${mockSignature}`;
}


/**
 * Extracts the user role from the active JWT token.
 */
export function getUserRole(): string {
  const token = getAccessToken();
  if (!token) return '';
  const payload = decodeJwt(token);
  if (!payload) return '';
  const role =
    payload.role ||
    (payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] as string);
  if (Array.isArray(role)) {
    return String(role[0] || '');
  }
  return typeof role === 'string' ? role : '';
}

/**
 * Extracts the user email from the active JWT token.
 * Prevents duplicated display by normalizing array-valued claims to a single string.
 */
export function getUserEmail(): string {
  const token = getAccessToken();
  if (!token) return '';
  const payload = decodeJwt(token);
  if (!payload) return '';
  const email =
    payload.email ||
    (payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] as string);
  if (Array.isArray(email)) {
    return String(email[0] || '');
  }
  return typeof email === 'string' ? email : '';
}

/**
 * Extracts the user display name or username from the active JWT token.
 * Prevents duplicated display by normalizing array-valued claims to a single string.
 */
export function getUserName(): string {
  const token = getAccessToken();
  if (!token) return 'Administrator';
  const payload = decodeJwt(token);
  if (!payload) return 'Administrator';
  const name =
    payload.name ||
    payload.unique_name ||
    (payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] as string) ||
    payload.sub;
  if (Array.isArray(name)) {
    return String(name[0] || 'Administrator');
  }
  return typeof name === 'string' ? name : 'Administrator';
}

/**
 * Extracts granular permissions from the active JWT token claims.
 */
export function getUserPermissions(): string[] {
  const token = getAccessToken();
  if (!token) return [];
  const payload = decodeJwt(token);
  if (!payload) return [];

  const role = getUserRole();
  if (role === 'Admin') {
    return ['staff:read', 'staff:write', 'client:read', 'client:write'];
  }

  const permissions = payload.permission || payload.permissions;
  if (Array.isArray(permissions)) {
    return permissions.map((p) => String(p));
  }
  if (typeof permissions === 'string') {
    return [permissions];
  }

  if (role === 'StaffReadOnly' || role === 'ReadOnly') {
    return ['staff:read', 'client:read'];
  }

  return [];
}

/**
 * Checks if the current user possesses a specific permission.
 */
export function hasPermission(permission: string): boolean {
  const permissions = getUserPermissions();
  return permissions.includes(permission);
}

/**
 * Checks if the current user has permission to create, edit, or delete staff.
 */
export function canWriteStaff(): boolean {
  return hasPermission('staff:write');
}

/**
 * Checks if the current user has permission to create, edit, or delete clients.
 */
export function canWriteClient(): boolean {
  return hasPermission('client:write');
}
