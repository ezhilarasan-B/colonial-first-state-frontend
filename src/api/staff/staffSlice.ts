/**
 * Staff Redux Slice
 * Centralized client-side cache and pagination state for Staff directory.
 * Enforces 10 items per page pagination.
 * Supports integer IDs (1, 2, 3...)
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Staff, StaffPayload, StaffState, PaginatedResult, BulkDeleteStaffResponse } from './staffTypes';
import { staffApi } from './staffApi';
import { showToast } from '../../app/toastSlice';
import type { RootState, AppDispatch } from '../../app/store';

const initialState: StaffState = {
  staffList: [],
  totalCount: 0,
  currentPage: 1,
  pageSize: 10,
  selectedIds: [],
  loading: false,
  error: null,
  initialLoaded: false,
};

/**
 * Fetch paginated staff (default 10 items per page)
 */
export const fetchStaff = createAsyncThunk<
  PaginatedResult<Staff>,
  { pageNumber?: number; pageSize?: number } | void,
  { state: RootState; rejectValue: string }
>('staff/fetchStaff', async (params, { rejectWithValue }) => {
  try {
    const page = params?.pageNumber ?? 1;
    const size = params?.pageSize ?? 10;
    return await staffApi.getStaff(page, size);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch staff directory';
    return rejectWithValue(message);
  }
});

/**
 * Create a new staff member
 */
export const createStaffThunk = createAsyncThunk<
  Staff,
  StaffPayload,
  { state: RootState; dispatch: AppDispatch; rejectValue: string }
>('staff/createStaff', async (payload, { dispatch, rejectWithValue }) => {
  try {
    const newStaff = await staffApi.createStaff(payload);
    dispatch(
      showToast({
        message: `Staff member "${newStaff.name}" created successfully.`,
        type: 'success',
      })
    );
    return newStaff;
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to create staff member';
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
 * Update an existing staff member
 */
export const updateStaffThunk = createAsyncThunk<
  Staff,
  { id: number | string; payload: StaffPayload },
  { state: RootState; dispatch: AppDispatch; rejectValue: string }
>('staff/updateStaff', async ({ id, payload }, { dispatch, rejectWithValue }) => {
  try {
    const updatedStaff = await staffApi.updateStaff(id, payload);
    dispatch(
      showToast({
        message: `Staff member "${updatedStaff.name}" updated successfully.`,
        type: 'success',
      })
    );
    return updatedStaff;
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to update staff member';
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
 * Delete a staff member
 */
export const deleteStaffThunk = createAsyncThunk<
  number | string,
  number | string,
  { state: RootState; dispatch: AppDispatch; rejectValue: string }
>('staff/deleteStaff', async (id, { dispatch, rejectWithValue }) => {
  try {
    await staffApi.deleteStaff(id);
    dispatch(
      showToast({
        message: 'Staff member deleted successfully.',
        type: 'success',
      })
    );
    return id;
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      (error instanceof Error ? error.message : "Staff was assigned to client, we can't delete.");
    dispatch(
      showToast({
        message,
        type: 'error',
        duration: 6000,
      })
    );
    return rejectWithValue(message);
  }
});

/**
 * Bulk delete staff members
 */
export const bulkDeleteStaffThunk = createAsyncThunk<
  BulkDeleteStaffResponse,
  number[],
  { state: RootState; dispatch: AppDispatch; rejectValue: string }
>('staff/bulkDeleteStaff', async (ids, { dispatch, rejectWithValue }) => {
  try {
    const result = await staffApi.bulkDeleteStaff(ids);
    if (result.deletedIds.length > 0) {
      dispatch(
        showToast({
          message: `Successfully deleted ${result.deletedIds.length} staff member(s).`,
          type: 'success',
        })
      );
    }
    if (result.failedStaff && result.failedStaff.length > 0) {
      const failedMsg =
        result.failedStaff.length === 1
          ? "Staff was assigned to client, we can't delete."
          : `Staff was assigned to client, we can't delete: ${result.failedStaff.map((s) => s.name).join(', ')}`;
      dispatch(
        showToast({
          message: failedMsg,
          type: 'error',
          duration: 6000,
        })
      );
    }
    return result;
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      (error instanceof Error ? error.message : "Staff was assigned to client, we can't delete.");
    dispatch(
      showToast({
        message,
        type: 'error',
        duration: 6000,
      })
    );
    return rejectWithValue(message);
  }
});

export const staffSlice = createSlice({
  name: 'staff',
  initialState,
  reducers: {
    setStaffList: (state, action: PayloadAction<Staff[]>) => {
      state.staffList = action.payload;
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
    addStaff: (state, action: PayloadAction<Staff>) => {
      state.staffList.unshift(action.payload);
      state.totalCount += 1;
    },
    updateStaffItem: (state, action: PayloadAction<Staff>) => {
      const index = state.staffList.findIndex((s) => s.id === action.payload.id);
      if (index !== -1) {
        state.staffList[index] = action.payload;
      }
    },
    removeStaffItem: (state, action: PayloadAction<number | string>) => {
      state.staffList = state.staffList.filter((s) => String(s.id) !== String(action.payload));
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
    setSelectedStaff: (state, action: PayloadAction<number[]>) => {
      state.selectedIds = action.payload;
    },
    toggleSelectStaff: (state, action: PayloadAction<number>) => {
      const id = action.payload;
      if (state.selectedIds.includes(id)) {
        state.selectedIds = state.selectedIds.filter((selectedId) => selectedId !== id);
      } else {
        state.selectedIds.push(id);
      }
    },
    toggleSelectAll: (state) => {
      if (state.selectedIds.length === state.staffList.length) {
        state.selectedIds = [];
      } else {
        state.selectedIds = state.staffList.map((s) => s.id);
      }
    },
    clearSelection: (state) => {
      state.selectedIds = [];
    },
  },
  extraReducers: (builder) => {
    // fetchStaff
    builder.addCase(fetchStaff.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchStaff.fulfilled, (state, action) => {
      state.loading = false;
      state.staffList = action.payload.items;
      state.totalCount = action.payload.totalCount;
      state.currentPage = action.payload.pageNumber;
      state.pageSize = action.payload.pageSize;
      state.initialLoaded = true;
      state.error = null;
    });
    builder.addCase(fetchStaff.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload ?? 'Failed to load staff records';
    });

    // createStaffThunk
    builder.addCase(createStaffThunk.fulfilled, (state, action) => {
      state.staffList.unshift(action.payload);
      state.totalCount += 1;
    });

    // updateStaffThunk
    builder.addCase(updateStaffThunk.fulfilled, (state, action) => {
      const index = state.staffList.findIndex((s) => s.id === action.payload.id);
      if (index !== -1) {
        state.staffList[index] = action.payload;
      }
    });

    // deleteStaffThunk
    builder.addCase(deleteStaffThunk.fulfilled, (state, action) => {
      state.staffList = state.staffList.filter((s) => String(s.id) !== String(action.payload));
      state.selectedIds = state.selectedIds.filter((id) => String(id) !== String(action.payload));
      state.totalCount = Math.max(0, state.totalCount - 1);
    });

    // bulkDeleteStaffThunk
    builder.addCase(bulkDeleteStaffThunk.fulfilled, (state, action) => {
      const deletedSet = new Set(action.payload.deletedIds.map(String));
      state.staffList = state.staffList.filter((s) => !deletedSet.has(String(s.id)));
      state.selectedIds = state.selectedIds.filter((id) => !deletedSet.has(String(id)));
      state.totalCount = Math.max(0, state.totalCount - action.payload.deletedIds.length);
    });
  },
});

export const {
  setStaffList,
  setCurrentPage,
  setPageSize,
  addStaff,
  updateStaffItem,
  removeStaffItem,
  setLoading,
  setError,
  clearError,
  setSelectedStaff,
  toggleSelectStaff,
  toggleSelectAll,
  clearSelection,
} = staffSlice.actions;

export const staffReducer = staffSlice.reducer;

// Selectors
export const selectStaff = (state: RootState) => state.staff?.staffList || [];
export const selectStaffTotalCount = (state: RootState) => state.staff?.totalCount ?? 0;
export const selectStaffCurrentPage = (state: RootState) => state.staff?.currentPage ?? 1;
export const selectStaffPageSize = (state: RootState) => state.staff?.pageSize ?? 10;
export const selectStaffLoading = (state: RootState) => state.staff?.loading ?? false;
export const selectStaffError = (state: RootState) => state.staff?.error ?? null;
export const selectStaffInitialLoaded = (state: RootState) => state.staff?.initialLoaded ?? false;
export const selectSelectedStaffIds = (state: RootState) => state.staff?.selectedIds ?? [];

export const selectStaffById = (id?: number | string) => (state: RootState) => {
  if (id === undefined || id === null) return undefined;
  return selectStaff(state).find((s: Staff) => String(s.id) === String(id));
};

export const selectIsAllStaffSelected = (state: RootState) => {
  const staff = selectStaff(state);
  const selectedIds = selectSelectedStaffIds(state);
  return staff.length > 0 && selectedIds.length === staff.length;
};

export const selectIsStaffIndeterminate = (state: RootState) => {
  const staff = selectStaff(state);
  const selectedIds = selectSelectedStaffIds(state);
  return selectedIds.length > 0 && selectedIds.length < staff.length;
};
