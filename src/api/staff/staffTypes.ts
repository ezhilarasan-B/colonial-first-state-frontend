/**
 * Staff Domain Types and Interfaces
 * Uses integer IDs (1, 2, 3...)
 */

export interface Staff {
  id: number;
  name: string;
  age: number;
  city: string;
  state: string;
  pincode: string;
  createdDate?: string;
  modifiedDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StaffPayload {
  name: string;
  age: number;
  city: string;
  state: string;
  pincode: string;
}

export type StaffFormErrors = Partial<Record<keyof StaffPayload, string>>;

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface StaffState {
  staffList: Staff[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  selectedIds: number[];
  loading: boolean;
  error: string | null;
  initialLoaded: boolean;
}

export interface StaffAssignedClientFailure {
  id: number;
  name: string;
  reason: string;
}

export interface BulkDeleteStaffResponse {
  deletedIds: number[];
  failedStaff: StaffAssignedClientFailure[];
  message: string;
}
