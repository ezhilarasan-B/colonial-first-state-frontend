/**
 * Client API Service
 * Centralized API operations for Client resource.
 * Uses centralized apiClient and endpoint constants.
 */

import { apiClient } from '../common/apiClient';
import { API_ENDPOINTS } from '../../constants';
import type { Client, ClientPayload, PaginatedResult, BulkDeleteClientResponse } from './clientTypes';

export const clientApi = {
  /**
   * Fetch paginated clients from the backend (default 10 items per page)
   */
  getClients: async (
    pageNumber: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedResult<Client>> => {
    const response = await apiClient.get<PaginatedResult<Client> | Client[]>(
      API_ENDPOINTS.CLIENT,
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
   * Fetch a single client by ID
   */
  getClientById: async (id: number | string): Promise<Client> => {
    const response = await apiClient.get<Client>(API_ENDPOINTS.CLIENT_BY_ID(id));
    return response.data;
  },

  /**
   * Create a new client assigned to a staff member
   */
  createClient: async (payload: ClientPayload): Promise<Client> => {
    const response = await apiClient.post<Client>(API_ENDPOINTS.CLIENT, payload);
    return response.data;
  },

  /**
   * Update an existing client
   */
  updateClient: async (id: number | string, payload: ClientPayload): Promise<Client> => {
    const response = await apiClient.put<Client>(
      API_ENDPOINTS.CLIENT_BY_ID(id),
      payload
    );
    return response.data;
  },

  /**
   * Delete a client by ID
   */
  deleteClient: async (id: number | string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.CLIENT_BY_ID(id));
  },

  /**
   * Bulk delete clients by IDs
   */
  bulkDeleteClients: async (ids: number[]): Promise<BulkDeleteClientResponse> => {
    const response = await apiClient.post<BulkDeleteClientResponse>(
      API_ENDPOINTS.CLIENT_BULK_DELETE,
      { ids }
    );
    return response.data;
  },
};
