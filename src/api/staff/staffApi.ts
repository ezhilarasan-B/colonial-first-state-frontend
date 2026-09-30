/**
 * Staff API Service
 * Centralized API operations for Staff resource.
 * Uses centralized apiClient and endpoint constants.
 */

import { apiClient } from '../common/apiClient';
import { API_ENDPOINTS } from '../../constants';
import type { Staff, StaffPayload, PaginatedResult, BulkDeleteStaffResponse } from './staffTypes';

export const staffApi = {
  /**
   * Fetch paginated staff from the backend (default 10 items per page)
   */
  getStaff: async (
    pageNumber: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedResult<Staff>> => {
    const response = await apiClient.get<PaginatedResult<Staff> | Staff[]>(
      API_ENDPOINTS.STAFF,
      {
        params: { pageNumber, pageSize },
      }
    );

    // Normalize direct array response if legacy endpoint returns array
    if (Array.isArray(response.data)) {
      const allItems = response.data;
      const totalCount = allItems.length;
      const startIndex = (pageNumber - 1) * pageSize;
      const items = allItems.slice(startIndex, startIndex + pageSize);
      const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
      return {
        items,
        totalCount,
        pageNumber,
        pageSize,
        totalPages,
        hasNextPage: pageNumber < totalPages,
        hasPreviousPage: pageNumber > 1,
      };
    }

    return response.data;
  },

  /**
   * Fetch all staff without pagination (for client dropdown assignment)
   */
  getAllStaff: async (): Promise<Staff[]> => {
    try {
      const response = await apiClient.get<Staff[]>('/staff/all');
      if (Array.isArray(response.data)) {
        return response.data;
      }
    } catch {
      // Fallback
    }
    const paged = await staffApi.getStaff(1, 1000);
    return paged.items;
  },

  /**
   * Fetch a single staff member by ID
   */
  getStaffById: async (id: number | string): Promise<Staff> => {
    const response = await apiClient.get<Staff>(API_ENDPOINTS.STAFF_BY_ID(id));
    return response.data;
  },

  /**
   * Create a new staff member
   */
  createStaff: async (payload: StaffPayload): Promise<Staff> => {
    const response = await apiClient.post<Staff>(API_ENDPOINTS.STAFF, payload);
    return response.data;
  },

  /**
   * Update an existing staff member
   */
  updateStaff: async (id: number | string, payload: StaffPayload): Promise<Staff> => {
    const response = await apiClient.put<Staff>(
      API_ENDPOINTS.STAFF_BY_ID(id),
      payload
    );
    return response.data;
  },

  /**
   * Delete a staff member by ID
   */
  deleteStaff: async (id: number | string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.STAFF_BY_ID(id));
  },

  /**
   * Bulk delete staff members by IDs
   */
  bulkDeleteStaff: async (ids: number[]): Promise<BulkDeleteStaffResponse> => {
    const response = await apiClient.post<BulkDeleteStaffResponse>(
      API_ENDPOINTS.STAFF_BULK_DELETE,
      { ids }
    );
    return response.data;
  },
};
