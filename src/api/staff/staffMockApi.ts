/**
 * Staff Mock API Adapter for Axios
 * Simulates the .NET 8 Staff Directory backend with JWT auth,
 * pagination (10 items per page), and soft-delete semantics.
 * Uses integer IDs (1, 2, 3...)
 */

import type { InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import type { Staff, StaffPayload, PaginatedResult } from './staffTypes';
import { createMockJwt } from '../common/tokenHelper';

const INITIAL_MOCK_STAFF: Staff[] = [
  {
    id: 1,
    name: 'Oliver Smith',
    age: 34,
    city: 'Sydney',
    state: 'New South Wales',
    pincode: '2000',
    createdDate: '2026-01-15T08:30:00.000Z',
    modifiedDate: '2026-01-15T08:30:00.000Z',
    createdAt: '2026-01-15T08:30:00.000Z',
    updatedAt: '2026-01-15T08:30:00.000Z',
  },
  {
    id: 2,
    name: 'Sophia Patel',
    age: 29,
    city: 'Melbourne',
    state: 'Victoria',
    pincode: '3000',
    createdDate: '2026-01-18T10:15:00.000Z',
    modifiedDate: '2026-01-18T10:15:00.000Z',
    createdAt: '2026-01-18T10:15:00.000Z',
    updatedAt: '2026-01-18T10:15:00.000Z',
  },
  {
    id: 3,
    name: 'Liam Chen',
    age: 42,
    city: 'Brisbane',
    state: 'Queensland',
    pincode: '4000',
    createdDate: '2026-02-01T14:20:00.000Z',
    modifiedDate: '2026-02-01T14:20:00.000Z',
    createdAt: '2026-02-01T14:20:00.000Z',
    updatedAt: '2026-02-01T14:20:00.000Z',
  },
  {
    id: 4,
    name: 'Emma Watson',
    age: 31,
    city: 'Perth',
    state: 'Western Australia',
    pincode: '6000',
    createdDate: '2026-02-10T11:45:00.000Z',
    modifiedDate: '2026-02-10T11:45:00.000Z',
    createdAt: '2026-02-10T11:45:00.000Z',
    updatedAt: '2026-02-10T11:45:00.000Z',
  },
  {
    id: 5,
    name: 'Noah Sharma',
    age: 38,
    city: 'Adelaide',
    state: 'South Australia',
    pincode: '5000',
    createdDate: '2026-02-14T09:00:00.000Z',
    modifiedDate: '2026-02-14T09:00:00.000Z',
    createdAt: '2026-02-14T09:00:00.000Z',
    updatedAt: '2026-02-14T09:00:00.000Z',
  },
  {
    id: 6,
    name: 'Olivia Taylor',
    age: 27,
    city: 'Hobart',
    state: 'Tasmania',
    pincode: '7000',
    createdDate: '2026-02-20T16:10:00.000Z',
    modifiedDate: '2026-02-20T16:10:00.000Z',
    createdAt: '2026-02-20T16:10:00.000Z',
    updatedAt: '2026-02-20T16:10:00.000Z',
  },
  {
    id: 7,
    name: 'Ethan Davis',
    age: 45,
    city: 'Darwin',
    state: 'Northern Territory',
    pincode: '0800',
    createdDate: '2026-03-01T12:00:00.000Z',
    modifiedDate: '2026-03-01T12:00:00.000Z',
    createdAt: '2026-03-01T12:00:00.000Z',
    updatedAt: '2026-03-01T12:00:00.000Z',
  },
  {
    id: 8,
    name: 'Mia Kumar',
    age: 33,
    city: 'Canberra',
    state: 'Australian Capital Territory',
    pincode: '2601',
    createdDate: '2026-03-05T15:30:00.000Z',
    modifiedDate: '2026-03-05T15:30:00.000Z',
    createdAt: '2026-03-05T15:30:00.000Z',
    updatedAt: '2026-03-05T15:30:00.000Z',
  },
  {
    id: 9,
    name: 'Lucas Martin',
    age: 36,
    city: 'Newcastle',
    state: 'New South Wales',
    pincode: '2300',
    createdDate: '2026-03-10T11:00:00.000Z',
    modifiedDate: '2026-03-10T11:00:00.000Z',
    createdAt: '2026-03-10T11:00:00.000Z',
    updatedAt: '2026-03-10T11:00:00.000Z',
  },
  {
    id: 10,
    name: 'Ava Wilson',
    age: 28,
    city: 'Gold Coast',
    state: 'Queensland',
    pincode: '4217',
    createdDate: '2026-03-12T09:45:00.000Z',
    modifiedDate: '2026-03-12T09:45:00.000Z',
    createdAt: '2026-03-12T09:45:00.000Z',
    updatedAt: '2026-03-12T09:45:00.000Z',
  },
  {
    id: 11,
    name: 'Jack Thompson',
    age: 39,
    city: 'Wollongong',
    state: 'New South Wales',
    pincode: '2500',
    createdDate: '2026-03-15T14:15:00.000Z',
    modifiedDate: '2026-03-15T14:15:00.000Z',
    createdAt: '2026-03-15T14:15:00.000Z',
    updatedAt: '2026-03-15T14:15:00.000Z',
  },
  {
    id: 12,
    name: 'Amelia Brown',
    age: 32,
    city: 'Geelong',
    state: 'Victoria',
    pincode: '3220',
    createdDate: '2026-03-18T16:20:00.000Z',
    modifiedDate: '2026-03-18T16:20:00.000Z',
    createdAt: '2026-03-18T16:20:00.000Z',
    updatedAt: '2026-03-18T16:20:00.000Z',
  },
];

let mockStaffList: Staff[] = [...INITIAL_MOCK_STAFF];

const delay = (ms: number = 200) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export async function mockAxiosAdapter(
  config: InternalAxiosRequestConfig
): Promise<AxiosResponse> {
  await delay(200);

  const fullUrl = config.url || '';
  const [pathname, queryString] = fullUrl.split('?');
  const method = (config.method || 'GET').toUpperCase();

  const searchParams = new URLSearchParams(queryString || '');
  const pageParam = config.params?.pageNumber || searchParams.get('pageNumber') || '1';
  const sizeParam = config.params?.pageSize || searchParams.get('pageSize') || '10';

  const pageNumber = Math.max(1, parseInt(String(pageParam), 10) || 1);
  const pageSize = Math.max(1, parseInt(String(sizeParam), 10) || 10);

  // Validate Authorization header presence
  const authHeader = config.headers?.Authorization;
  if (!authHeader && !fullUrl.includes('/auth/')) {
    return {
      data: { message: 'Unauthorized - Missing Bearer token' },
      status: 401,
      statusText: 'Unauthorized',
      headers: {},
      config,
    };
  }

  // Handle Refresh Token endpoint (Refresh Token Rotation using JWT)
  if (fullUrl.includes('/auth/refresh') && method === 'POST') {
    const newAccessToken = createMockJwt({ name: 'CFS Staff Admin (Rotated)', token_type: 'access' }, 900);
    const newRefreshToken = createMockJwt({ name: 'CFS Staff Admin (Rotated)', token_type: 'refresh' }, 7 * 86400);

    return {
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: 900,
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    };
  }

  // Handle GET /staff/all
  if (pathname.endsWith('/staff/all') && method === 'GET') {
    return {
      data: [...mockStaffList],
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    };
  }

  // Handle GET /staff or /users (Paginated Result, 10 items per page)
  const isStaffCollection = pathname.endsWith('/staff') || pathname.endsWith('/users');
  if (isStaffCollection && method === 'GET') {
    const totalCount = mockStaffList.length;
    const startIndex = (pageNumber - 1) * pageSize;
    const items = mockStaffList.slice(startIndex, startIndex + pageSize);
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

    const result: PaginatedResult<Staff> = {
      items,
      totalCount,
      pageNumber,
      pageSize,
      totalPages,
      hasNextPage: pageNumber < totalPages,
      hasPreviousPage: pageNumber > 1,
    };

    return {
      data: result,
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    };
  }

  // Handle POST /staff or /users
  if (isStaffCollection && method === 'POST') {
    const payload: StaffPayload =
      typeof config.data === 'string' ? JSON.parse(config.data) : config.data;

    const nextId = mockStaffList.reduce((max, s) => Math.max(max, s.id), 0) + 1;
    const now = new Date().toISOString();
    const newStaff: Staff = {
      id: nextId,
      name: payload.name.trim(),
      age: Number(payload.age),
      city: payload.city.trim(),
      state: payload.state.trim(),
      pincode: payload.pincode.trim(),
      createdDate: now,
      modifiedDate: now,
      createdAt: now,
      updatedAt: now,
    };

    mockStaffList.unshift(newStaff);

    return {
      data: newStaff,
      status: 201,
      statusText: 'Created',
      headers: {},
      config,
    };
  }

  // Pattern matching for /staff/:id or /users/:id
  const staffByIdMatch = pathname.match(/\/(?:staff|users)\/([^/?#]+)$/);
  if (staffByIdMatch) {
    const staffId = staffByIdMatch[1];
    const staffIndex = mockStaffList.findIndex((s) => String(s.id) === String(staffId));

    // GET /staff/:id
    if (method === 'GET') {
      if (staffIndex === -1) {
        return {
          data: { message: `Staff member with id ${staffId} not found` },
          status: 404,
          statusText: 'Not Found',
          headers: {},
          config,
        };
      }
      return {
        data: { ...mockStaffList[staffIndex] },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      };
    }

    // PUT /staff/:id
    if (method === 'PUT') {
      if (staffIndex === -1) {
        return {
          data: { message: `Staff member with id ${staffId} not found` },
          status: 404,
          statusText: 'Not Found',
          headers: {},
          config,
        };
      }

      const payload: StaffPayload =
        typeof config.data === 'string' ? JSON.parse(config.data) : config.data;

      const now = new Date().toISOString();
      const updatedStaff: Staff = {
        ...mockStaffList[staffIndex],
        name: payload.name.trim(),
        age: Number(payload.age),
        city: payload.city.trim(),
        state: payload.state.trim(),
        pincode: payload.pincode.trim(),
        modifiedDate: now,
        updatedAt: now,
      };

      mockStaffList[staffIndex] = updatedStaff;

      return {
        data: updatedStaff,
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      };
    }

    // DELETE /staff/:id
    if (method === 'DELETE') {
      if (staffIndex === -1) {
        return {
          data: { message: `Staff member with id ${staffId} not found` },
          status: 404,
          statusText: 'Not Found',
          headers: {},
          config,
        };
      }

      mockStaffList.splice(staffIndex, 1);

      return {
        data: { success: true, message: 'Staff deleted successfully' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      };
    }
  }

  return {
    data: { message: `Not found: ${method} ${fullUrl}` },
    status: 404,
    statusText: 'Not Found',
    headers: {},
    config,
  };
}

