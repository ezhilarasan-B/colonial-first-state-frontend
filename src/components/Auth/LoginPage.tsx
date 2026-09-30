/**
 * Dedicated Standalone Login Page
 * Landing page for unauthenticated visitors. Completely isolated from Layout,
 * without headers, sidebars, or authenticated navigation menus.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS, USE_MOCK_API, ROUTES } from '../../constants';
import { setTokens, createMockJwt } from '../../api/common/tokenHelper';
import { useAppDispatch } from '../../app/hooks';
import { showToast } from '../../app/toastSlice';
import type { LoginResponse } from '../../api/common/apiTypes';
import './login.css';

const CURRENT_YEAR = new Date().getFullYear();

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [username, setUsername] = useState<string>('admin');
  const [password, setPassword] = useState<string>('Password123!');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      setErrorMessage('Username is required.');
      return;
    }

    if (!password) {
      setErrorMessage('Password is required.');
      return;
    }

    setIsLoading(true);

    try {
      let accessToken: string;
      let refreshToken: string;

      if (USE_MOCK_API) {
        // Mock authentication simulation
        await new Promise((resolve) => setTimeout(resolve, 350));
        if (trimmedUsername === 'admin' && password === 'Password123!') {
          accessToken = createMockJwt(
            { sub: '1', name: 'Administrator', email: 'admin@cfs.local', role: 'Admin' },
            900
          );
          refreshToken = createMockJwt(
            { sub: '1', name: 'Administrator', email: 'admin@cfs.local', role: 'Admin', token_type: 'refresh' },
            7 * 86400
          );
        } else if (trimmedUsername === 'authuser' && password === 'Password123!') {
          accessToken = createMockJwt(
            {
              sub: '2',
              name: 'Auth User',
              email: 'authuser@cfs.com.au',
              role: 'StaffReadOnly',
              permission: ['staff:read', 'client:read', 'client:write'],
            },
            900
          );
          refreshToken = createMockJwt(
            {
              sub: '2',
              name: 'Auth User',
              email: 'authuser@cfs.com.au',
              role: 'StaffReadOnly',
              permission: ['staff:read', 'client:read', 'client:write'],
              token_type: 'refresh',
            },
            7 * 86400
          );
        } else {
          throw new Error('Invalid username or password (use admin or authuser with Password123!)');
        }
      } else {
        // Real .NET 8 Web API authentication
        const response = await axios.post<LoginResponse>(
          `${API_BASE_URL}${API_ENDPOINTS.LOGIN}`,
          {
            username: trimmedUsername,
            password,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        accessToken = response.data.accessToken;
        refreshToken = response.data.refreshToken;
      }

      // Store tokens for stateless session persistence
      setTokens(accessToken, refreshToken);

      dispatch(
        showToast({
          message: 'Authentication successful. Welcome to Colonial First State!',
          type: 'success',
        })
      );

      // Navigate to authenticated Dashboard
      navigate(ROUTES.DASHBOARD, { replace: true });
    } catch (err: unknown) {
      let message = 'Authentication failed. Please verify your credentials.';
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        message = err.response.data.message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-page__container">
        {/* Brand Header */}
        <div className="login-page__brand">
          <div className="login-page__logo-badge" aria-hidden="true">
            CFS
          </div>
          <h1 className="login-page__title">Colonial First State</h1>
          <p className="login-page__subtitle">
            Enterprise Directory & Client Management Portal
          </p>
        </div>

        {/* Login Card */}
        <div className="login-card">
          <div className="login-card__header">
            <h2 className="login-card__title">Sign In</h2>
            <p className="login-card__desc">
              Enter your corporate credentials to access the secure directory console.
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="login-card__error-banner" role="alert">
              <svg
                className="login-card__error-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form" noValidate>
            {/* Username Input */}
            <div className="login-form__group">
              <label htmlFor="login-username" className="login-form__label">
                Username
              </label>
              <div className="login-form__input-wrapper">
                <span className="login-form__input-icon" aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
                <input
                  id="login-username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  className="login-form__input"
                  placeholder="e.g. admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="login-form__group">
              <label htmlFor="login-password" className="login-form__label">
                Password
              </label>
              <div className="login-form__input-wrapper">
                <span className="login-form__input-icon" aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="login-form__input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  className="login-form__password-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* Demo Credentials Box */}
            <div className="login-form__credentials-hint">
              <strong>Corporate Credentials:</strong>
              <div>Admin (Full Access): <code>admin</code> / <code>Password123!</code></div>
              <div>Staff Read-Only: <code>authuser</code> / <code>Password123!</code></div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="login-form__submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="login-form__spinner" aria-hidden="true" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In to Dashboard &rarr;</span>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="login-page__footer">
          <span>&copy; {CURRENT_YEAR} Colonial First State. All rights reserved.</span>
          <span>Enterprise Directory Management Console &bull; Security Level: High</span>
        </div>
      </div>
    </div>
  );
};
