/**
 * Common API Types and Interfaces
 */

export interface TokenPayload {
  sub: string;
  email?: string;
  name?: string;
  role?: string;
  token_type?: string;
  exp: number;
  iat?: number;
  [key: string]: unknown;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  username: string;
  role: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}
