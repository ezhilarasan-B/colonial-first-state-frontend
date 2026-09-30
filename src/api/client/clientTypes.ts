/**
 * Client Domain Types and Interfaces
 * Uses integer IDs (1, 2, 3...)
 */

import type { PaginatedResult } from '../staff/staffTypes';

export interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  staffId: number;
  staffName?: string;
  createdDate?: string;
  modifiedDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClientPayload {
  name: string;
  email: string;
  phone: string;
  company: string;
  staffId: number;
}

export type ClientFormErrors = Partial<Record<keyof ClientPayload, string>>;

export interface ClientState {
  clientList: Client[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  selectedIds: number[];
  loading: boolean;
  error: string | null;
  initialLoaded: boolean;
}

export interface BulkDeleteClientResponse {
  deletedIds: number[];
  message: string;
}

export type { PaginatedResult };
