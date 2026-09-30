/**
 * Centralized Route Constants
 * All application navigation paths must use these constants.
 */

export const ROUTES = {
  ROOT: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',

  // Staff Routes
  STAFF: '/staff',
  STAFF_ADD: '/staff/add',
  STAFF_EDIT: '/staff/edit/:id',
  STAFF_EDIT_PATH: (id: string | number) => `/staff/edit/${id}`,

  // Client Routes
  CLIENT: '/client',
  CLIENT_ADD: '/client/add',
  CLIENT_EDIT: '/client/edit/:id',
  CLIENT_EDIT_PATH: (id: string | number) => `/client/edit/${id}`,
} as const;
