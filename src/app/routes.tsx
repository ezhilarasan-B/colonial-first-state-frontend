/**
 * Application Routes Configuration
 * Defines protected and public routing trees.
 * The Login page is rendered completely standalone without the Layout wrapper.
 * Browser refresh preserves authenticated sessions without redirecting to Login.
 */

import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { ROUTES, SESSION_MESSAGES } from '../constants';
import { hasValidSession, canWriteStaff } from '../api/common/tokenHelper';
import { Layout } from '../components/Layout/Layout';
import { LoginPage } from '../components/Auth/LoginPage';
import { StaffList } from '../components/Staff/StaffList';
import { StaffForm } from '../components/Staff/StaffForm';
import { ClientList } from '../components/Client/ClientList';
import { ClientForm } from '../components/Client/ClientForm';
import { useAppDispatch, useAppSelector } from './hooks';
import { showToast } from './toastSlice';
import { selectStaff, selectStaffTotalCount, fetchStaff } from '../api/staff/staffSlice';
import { selectClients, selectClientTotalCount, fetchClients } from '../api/client/clientSlice';
import { Button } from '../package/UI';

/**
 * Route guard for authenticated pages.
 * If user has a valid or refreshable session, renders child routes inside Layout.
 * If session was cleared or expired, triggers warning toast and redirects to /login.
 */
const ProtectedRoute: React.FC = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const authenticated = hasValidSession();

  if (!authenticated) {
    if (sessionStorage.getItem('cfs_session_cleared') === 'true') {
      sessionStorage.removeItem('cfs_session_cleared');
      dispatch(
        showToast({
          message: SESSION_MESSAGES.SESSION_EXPIRED_CLEARED,
          type: 'warning',
        })
      );
    }
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  return <Outlet />;
};

/**
 * Route guard for staff write operations (Add / Edit).
 * Restricts access for read-only staff roles like authuser.
 */
const StaffWriteGuard: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  if (!canWriteStaff()) {
    return <Navigate to={ROUTES.STAFF} replace />;
  }
  return children;
};

/**
 * Route guard for unauthenticated pages (e.g., Login).
 * If user already has a valid session, redirects to /dashboard.
 */
const PublicOnlyRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const authenticated = hasValidSession();

  if (authenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return children;
};

/**
 * Executive Dashboard Overview Component
 */
const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const staff = useAppSelector(selectStaff);
  const totalStaffCount = useAppSelector(selectStaffTotalCount);
  const clients = useAppSelector(selectClients);
  const totalClientCount = useAppSelector(selectClientTotalCount);

  useEffect(() => {
    dispatch(fetchStaff({ pageNumber: 1, pageSize: 10 }));
    dispatch(fetchClients({ pageNumber: 1, pageSize: 10 }));
  }, [dispatch]);

  return (
    <div className="staff-view">
      <div className="staff-view__header">
        <div>
          <h1 className="staff-view__title">Executive Dashboard</h1>
          <p className="staff-view__subtitle">
            Welcome to Colonial First State Enterprise Directory & Client Management Console.
          </p>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.25rem',
          margin: '1.5rem 0',
        }}
      >
        {/* Staff Directory Card */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 600 }}>
              Staff Directory Records
            </div>
            <div
              style={{
                fontSize: '2.25rem',
                fontWeight: 700,
                color: '#002b49',
                margin: '0.5rem 0 1rem 0',
              }}
            >
              {totalStaffCount || staff.length}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(ROUTES.STAFF)}
            >
              View Staff Directory &rarr;
            </Button>
            {canWriteStaff() && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate(ROUTES.STAFF_ADD)}
              >
                + Add Staff
              </Button>
            )}
          </div>
        </div>

        {/* Client Accounts Card */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 600 }}>
              Client Accounts
            </div>
            <div
              style={{
                fontSize: '2.25rem',
                fontWeight: 700,
                color: '#002b49',
                margin: '0.5rem 0 1rem 0',
              }}
            >
              {totalClientCount || clients.length}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(ROUTES.CLIENT)}
            >
              Manage Clients &rarr;
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate(ROUTES.CLIENT_ADD)}
            >
              + Add Client
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Root Path: Redirect based on authentication state */}
      <Route
        path={ROUTES.ROOT}
        element={
          hasValidSession() ? (
            <Navigate to={ROUTES.DASHBOARD} replace />
          ) : (
            <Navigate to={ROUTES.LOGIN} replace />
          )
        }
      />

      {/* Standalone Login Route (No Layout, No Sidebar, No Header) */}
      <Route
        path={ROUTES.LOGIN}
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />

      {/* Protected Routes (Rendered inside the persistent Authenticated Layout) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />

          {/* Staff Directory Routes */}
          <Route path={ROUTES.STAFF} element={<StaffList />} />
          <Route
            path={ROUTES.STAFF_ADD}
            element={
              <StaffWriteGuard>
                <StaffForm mode="add" />
              </StaffWriteGuard>
            }
          />
          <Route
            path={ROUTES.STAFF_EDIT}
            element={
              <StaffWriteGuard>
                <StaffForm mode="edit" />
              </StaffWriteGuard>
            }
          />

          {/* Client Management Routes */}
          <Route path={ROUTES.CLIENT} element={<ClientList />} />
          <Route path={ROUTES.CLIENT_ADD} element={<ClientForm mode="add" />} />
          <Route path={ROUTES.CLIENT_EDIT} element={<ClientForm mode="edit" />} />

          {/* Backward Compatibility Redirects for /user routes */}
          <Route path="/user" element={<Navigate to={ROUTES.STAFF} replace />} />
          <Route
            path="/user/add"
            element={
              <StaffWriteGuard>
                <Navigate to={ROUTES.STAFF_ADD} replace />
              </StaffWriteGuard>
            }
          />
          <Route
            path="/user/edit/:id"
            element={
              <StaffWriteGuard>
                <StaffForm mode="edit" />
              </StaffWriteGuard>
            }
          />

          {/* Wildcard Fallback */}
          <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
        </Route>
      </Route>
    </Routes>
  );
};
