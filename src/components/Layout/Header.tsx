/**
 * Application Header Component
 * Displays application branding, API connection status, "Clear Session" button,
 * and User Profile dropdown with "Logout" option.
 */

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  clearTokens,
  getUserName,
  getUserRole,
  getUserEmail,
} from '../../api/common/tokenHelper';
import { USE_MOCK_API, ROUTES } from '../../constants';

export interface HeaderProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  isSidebarOpen,
}) => {
  const navigate = useNavigate();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState<boolean>(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const userName = getUserName();
  const userRole = getUserRole() || 'Admin';
  const userEmail = getUserEmail() || (USE_MOCK_API ? 'admin@cfs.local' : 'admin@cfs.com.au');

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleClearSession = () => {
    clearTokens();
    sessionStorage.setItem('cfs_session_cleared', 'true');
    setIsProfileMenuOpen(false);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('cfs_session_cleared');
    clearTokens();
    setIsProfileMenuOpen(false);
    navigate(ROUTES.LOGIN, { replace: true });
  };

  return (
    <header className="app-header">
      <div className="app-header__left">
        <button
          type="button"
          className="app-header__menu-btn"
          onClick={onToggleSidebar}
          aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          aria-expanded={isSidebarOpen}
        >
          <svg
            className="app-header__menu-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {isSidebarOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>

        <div className="app-header__brand">
          <div className="app-header__logo" aria-hidden="true">
            CFS
          </div>
          <div className="app-header__title-group">
            <span className="app-header__title">Colonial First State</span>
            <span className="app-header__subtitle">Enterprise Directory</span>
          </div>
        </div>
      </div>

      <div className="app-header__right">
        {/* Dynamic API Connection Status Badge */}
        <div
          className={`app-header__badge ${
            USE_MOCK_API ? 'app-header__badge--mock' : 'app-header__badge--live'
          }`}
        >
          <span className="app-header__badge-dot" />
          <span className="app-header__badge-text">
            {USE_MOCK_API ? 'Mock API Mode' : 'Live API Mode (.NET 8)'}
          </span>
        </div>

        {/* Clear Session Header Button */}
        <button
          type="button"
          className="app-header__clear-session-btn"
          onClick={handleClearSession}
          title="Clear all stored authentication details and return to Login"
        >
          <svg
            className="app-header__clear-session-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          <span>Clear Session</span>
        </button>

        {/* User Profile Section with Dropdown Menu */}
        <div className="app-header__profile-container" ref={profileMenuRef}>
          <button
            type="button"
            className="app-header__user-profile-btn"
            onClick={() => setIsProfileMenuOpen((prev) => !prev)}
            aria-expanded={isProfileMenuOpen}
            aria-haspopup="true"
            aria-label="User Profile Menu"
          >
            <div className="app-header__avatar" aria-hidden="true">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="app-header__user-details">
              <span className="app-header__user-name">{userName}</span>
              <span className="app-header__user-role">{userRole}</span>
            </div>
            <svg
              className={`app-header__caret ${
                isProfileMenuOpen ? 'app-header__caret--open' : ''
              }`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileMenuOpen && (
            <div className="app-header__profile-dropdown" role="menu">
              <div className="app-header__dropdown-header">
                <span className="app-header__dropdown-user">{userName}</span>
                <span className="app-header__dropdown-role">Role: {userRole}</span>
                <span className="app-header__dropdown-email">{userEmail}</span>
              </div>

              <div className="app-header__dropdown-divider" />

              <button
                type="button"
                className="app-header__dropdown-item app-header__dropdown-item--logout"
                onClick={handleLogout}
                role="menuitem"
              >
                <svg
                  className="app-header__dropdown-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
