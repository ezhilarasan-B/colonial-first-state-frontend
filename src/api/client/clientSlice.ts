/**
 * Client Redux Slice
 * Centralized client-side cache and pagination state for Client directory.
 * Enforces 10 items per page pagination.
 * Supports integer IDs (1, 2, 3...)
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Client, ClientPayload, ClientState, PaginatedResult, BulkDeleteClientResponse } from './clientTypes';
import { clientApi } from './clientApi';
import { showToast } from '../../app/toastSlice';
import type { RootState, AppDispatch } from '../../app/store';

const initialState: ClientState = {
  clientList: [],
  totalCount: 0,
  currentPage: 1,
  pageSize: 10,
  selectedIds: [],
  loading: false,
  error: null,
  initialLoaded: false,
};

/**
 * Fetch paginated clients (default 10 items per page)
 */
export const fetchClients = createAsyncThunk<
  PaginatedResult<Client>,
  { pageNumber?: number; pageSize?: number } | void,
  { state: RootState; rejectValue: string }
>('client/fetchClients', async (params, { rejectWithValue }) => {
  try {
    const page = params?.pageNumber ?? 1;
    const size = params?.pageSize ?? 10;
    return await clientApi.getClients(page, size);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch client directory';
    return rejectWithValue(message);
  }
});

/**
 * Create a new client
 */
export const createClientThunk = createAsyncThunk<
  Client,
  ClientPayload,
  { state: RootState; dispatch: AppDispatch; rejectValue: string }
>('client/createClient', async (payload, { dispatch, rejectWithValue }) => {
  try {
    const newClient = await clientApi.createClient(payload);
    dispatch(
      showToast({
        message: `Client "${newClient.name}" created successfully.`,
        type: 'success',
      })
    );
    return newClient;
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to create client';
    dispatch(
      showToast({
        message,
        type: 'error',
      })
    );
    return rejectWithValue(message);
  }
});

/**
 * Update an existing client
 */
export const updateClientThunk = createAsyncThunk<
  Client,
  { id: number | string; payload: ClientPayload },
  { state: RootState; dispatch: AppDispatch; rejectValue: string }
>('client/updateClient', async ({ id, payload }, { dispatch, rejectWithValue }) => {
  try {
    const updatedClient = await clientApi.updateClient(id, payload);
    dispatch(
      showToast({
        message: `Client "${updatedClient.name}" updated successfully.`,
        type: 'success',
      })
    );
    return updatedClient;
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to update client';
    dispatch(
      showToast({
        message,
        type: 'error',
      })
    );
    return rejectWithValue(message);
  }
});

/**
 * Delete a client
 */
export const deleteClientThunk = createAsyncThunk<
  number | string,
  number | string,
  { state: RootState; dispatch: AppDispatch; rejectValue: string }
>('client/deleteClient', async (id, { dispatch, rejectWithValue }) => {
  try {
    await clientApi.deleteClient(id);
    dispatch(
      showToast({
        message: 'Client deleted successfully.',
        type: 'success',
      })
    );
    return id;
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      (error instanceof Error ? error.message : 'Failed to delete client');
    dispatch(
      showToast({
        message,
        type: 'error',
      })
    );
    return rejectWithValue(message);
  }
});

/**
 * Bulk delete clients
 */
export const bulkDeleteClientsThunk = createAsyncThunk<
  BulkDeleteClientResponse,
  number[],
  { state: RootState; dispatch: AppDispatch; rejectValue: string }
>('client/bulkDeleteClients', async (ids, { dispatch, rejectWithValue }) => {
  try {
    const result = await clientApi.bulkDeleteClients(ids);
    dispatch(
      showToast({
        message: `Successfully deleted ${result.deletedIds.length} client(s).`,
        type: 'success',
      })
    );
    return result;
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      (error instanceof Error ? error.message : 'Failed to delete client(s)');
    dispatch(
      showToast({
        message,
        type: 'error',
      })
    );
    return rejectWithValue(message);
  }
});

export const clientSlice = createSlice({
  name: 'client',
  initialState,
  reducers: {
    setClientList: (state, action: PayloadAction<Client[]>) => {
      state.clientList = action.payload;
      state.totalCount = action.payload.length;
      state.initialLoaded = true;
      state.error = null;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
      state.currentPage = 1;
    },
    addClient: (state, action: PayloadAction<Client>) => {
      state.clientList.unshift(action.payload);
      state.totalCount += 1;
    },
    updateClientItem: (state, action: PayloadAction<Client>) => {
      const index = state.clientList.findIndex((c) => c.id === action.payload.id);
      if (index !== -1) {
        state.clientList[index] = action.payload;
      }
    },
    removeClientItem: (state, action: PayloadAction<number | string>) => {
      state.clientList = state.clientList.filter((c) => String(c.id) !== String(action.payload));
      state.selectedIds = state.selectedIds.filter((id) => String(id) !== String(action.payload));
      state.totalCount = Math.max(0, state.totalCount - 1);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setSelectedClients: (state, action: PayloadAction<number[]>) => {
      state.selectedIds = action.payload;
    },
    toggleSelectClient: (state, action: PayloadAction<number>) => {
      const id = action.payload;
      if (state.selectedIds.includes(id)) {
        state.selectedIds = state.selectedIds.filter((selectedId) => selectedId !== id);
      } else {
        state.selectedIds.push(id);
      }
    },
    toggleSelectAll: (state) => {
      if (state.selectedIds.length === state.clientList.length) {
        state.selectedIds = [];
      } else {
        state.selectedIds = state.clientList.map((c) => c.id);
      }
    },
    clearSelection: (state) => {
      state.selectedIds = [];
    },
  },
  extraReducers: (builder) => {
    // fetchClients
    builder.addCase(fetchClients.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchClients.fulfilled, (state, action) => {
      state.loading = false;
      state.clientList = action.payload.items;
      state.totalCount = action.payload.totalCount;
      state.currentPage = action.payload.pageNumber;
      state.pageSize = action.payload.pageSize;
      state.initialLoaded = true;
      state.error = null;
    });
    builder.addCase(fetchClients.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload ?? 'Failed to load client records';
    });

    // createClientThunk
    builder.addCase(createClientThunk.fulfilled, (state, action) => {
      state.clientList.unshift(action.payload);
      state.totalCount += 1;
    });

    // updateClientThunk
    builder.addCase(updateClientThunk.fulfilled, (state, action) => {
      const index = state.clientList.findIndex((c) => c.id === action.payload.id);
      if (index !== -1) {
        state.clientList[index] = action.payload;
      }
    });

    // deleteClientThunk
    builder.addCase(deleteClientThunk.fulfilled, (state, action) => {
      state.clientList = state.clientList.filter((c) => String(c.id) !== String(action.payload));
      state.selectedIds = state.selectedIds.filter((id) => String(id) !== String(action.payload));
      state.totalCount = Math.max(0, state.totalCount - 1);
    });

    // bulkDeleteClientsThunk
    builder.addCase(bulkDeleteClientsThunk.fulfilled, (state, action) => {
      const deletedSet = new Set(action.payload.deletedIds.map(String));
      state.clientList = state.clientList.filter((c) => !deletedSet.has(String(c.id)));
      state.selectedIds = state.selectedIds.filter((id) => !deletedSet.has(String(id)));
      state.totalCount = Math.max(0, state.totalCount - action.payload.deletedIds.length);
    });
  },
});

export const {
  setClientList,
  setCurrentPage,
  setPageSize,
  addClient,
  updateClientItem,
  removeClientItem,
  setLoading,
  setError,
  clearError,
  setSelectedClients,
  toggleSelectClient,
  toggleSelectAll,
  clearSelection,
} = clientSlice.actions;

export const clientReducer = clientSlice.reducer;

// Selectors
export const selectClients = (state: RootState) => state.client?.clientList || [];
export const selectClientTotalCount = (state: RootState) => state.client?.totalCount ?? 0;
export const selectClientCurrentPage = (state: RootState) => state.client?.currentPage ?? 1;
export const selectClientPageSize = (state: RootState) => state.client?.pageSize ?? 10;
export const selectClientLoading = (state: RootState) => state.client?.loading ?? false;
export const selectClientError = (state: RootState) => state.client?.error ?? null;
export const selectClientInitialLoaded = (state: RootState) => state.client?.initialLoaded ?? false;
export const selectSelectedClientIds = (state: RootState) => state.client?.selectedIds ?? [];

export const selectClientById = (id?: number | string) => (state: RootState) => {
  if (id === undefined || id === null) return undefined;
  return selectClients(state).find((c: Client) => String(c.id) === String(id));
};

export const selectIsAllClientsSelected = (state: RootState) => {
  const clients = selectClients(state);
  const selectedIds = selectSelectedClientIds(state);
  return clients.length > 0 && selectedIds.length === clients.length;
};

export const selectIsClientIndeterminate = (state: RootState) => {
  const clients = selectClients(state);
  const selectedIds = selectSelectedClientIds(state);
  return selectedIds.length > 0 && selectedIds.length < clients.length;
};
