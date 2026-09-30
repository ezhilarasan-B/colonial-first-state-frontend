/**
 * Application Sidebar Component
 * Manages primary application navigation.
 * Keeps Staff menu active when visiting /staff, /staff/add, or /staff/edit/:id.
 * Keeps Client menu active when visiting /client, /client/add, or /client/edit/:id.
 */

import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ROUTES } from '../../constants';

export interface SidebarProps {
  isOpen: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onCloseMobile }) => {
  const location = useLocation();

  const isStaffMenuActive =
    location.pathname.startsWith('/staff') || location.pathname.startsWith('/user');
  const isClientMenuActive = location.pathname.startsWith('/client');
  const isDashboardActive = location.pathname === ROUTES.DASHBOARD;

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`app-sidebar-backdrop ${isOpen ? 'app-sidebar-backdrop--visible' : ''}`}
        onClick={onCloseMobile}
        aria-hidden="true"
      />

      <aside className={`app-sidebar ${isOpen ? 'app-sidebar--open' : ''}`}>
        <div className="app-sidebar__section-label">Main Navigation</div>
        <nav className="app-sidebar__nav" aria-label="Main Navigation">
          <NavLink
            to={ROUTES.DASHBOARD}
            className={`app-sidebar__item ${isDashboardActive ? 'app-sidebar__item--active' : ''}`}
            onClick={onCloseMobile}
          >
            <span className="app-sidebar__item-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            </span>
            <span className="app-sidebar__item-text">Dashboard</span>
          </NavLink>

          <NavLink
            to={ROUTES.STAFF}
            className={`app-sidebar__item ${isStaffMenuActive ? 'app-sidebar__item--active' : ''}`}
            onClick={onCloseMobile}
          >
            <span className="app-sidebar__item-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </span>
            <span className="app-sidebar__item-text">Staff</span>
            <span className="app-sidebar__item-badge">Directory</span>
          </NavLink>

          <NavLink
            to={ROUTES.CLIENT}
            className={`app-sidebar__item ${isClientMenuActive ? 'app-sidebar__item--active' : ''}`}
            onClick={onCloseMobile}
          >
            <span className="app-sidebar__item-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 21h18" />
                <path d="M5 21V7l8-4v18" />
                <path d="M19 21V11l-6-4" />
                <path d="M9 9h1" />
                <path d="M9 13h1" />
                <path d="M9 17h1" />
              </svg>
            </span>
            <span className="app-sidebar__item-text">Clients</span>
            <span className="app-sidebar__item-badge">Accounts</span>
          </NavLink>
        </nav>

        <div className="app-sidebar__footer">
          <div className="app-sidebar__info-card">
            <span className="app-sidebar__info-title">System Status</span>
            <span className="app-sidebar__info-desc">
              JWT Interceptors: Active
            </span>
            <span className="app-sidebar__info-desc">
              Token Rotation: Enabled
            </span>
            <span className="app-sidebar__info-desc">
              Pagination: 10 / page
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
