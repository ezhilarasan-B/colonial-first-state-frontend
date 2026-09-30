/**
 * Staff List Component
 * Displays staff directory table, pagination (10 items per page),
 * header action bar with '+ Add Staff', checkbox selection,
 * Action button dropdown with Delete, and updated confirmation modal.
 * Uses integer IDs (1, 2, 3...)
 */

import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  fetchStaff,
  deleteStaffThunk,
  bulkDeleteStaffThunk,
  toggleSelectStaff,
  toggleSelectAll,
  clearSelection,
  setCurrentPage,
  selectStaff,
  selectStaffTotalCount,
  selectStaffCurrentPage,
  selectStaffPageSize,
  selectStaffLoading,
  selectStaffError,
  selectStaffInitialLoaded,
  selectSelectedStaffIds,
  selectIsAllStaffSelected,
  selectIsStaffIndeterminate,
} from '../../api/staff/staffSlice';
import type { Staff } from '../../api/staff/staffTypes';
import { canWriteStaff } from '../../api/common/tokenHelper';
import { ROUTES } from '../../constants';
import { Button, Modal, Spinner, EmptyState, ErrorMessage, Pagination } from '../../package/UI';
import { StaffTable } from './StaffTable';
import './staff.css';

export const StaffList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const staffList = useAppSelector(selectStaff);
  const totalCount = useAppSelector(selectStaffTotalCount);
  const currentPage = useAppSelector(selectStaffCurrentPage);
  const pageSize = useAppSelector(selectStaffPageSize);
  const loading = useAppSelector(selectStaffLoading);
  const error = useAppSelector(selectStaffError);
  const initialLoaded = useAppSelector(selectStaffInitialLoaded);
  const selectedIds = useAppSelector(selectSelectedStaffIds);
  const isAllSelected = useAppSelector(selectIsAllStaffSelected);
  const isIndeterminate = useAppSelector(selectIsStaffIndeterminate);

  // Delete modal & action menu state
  const [singleStaffToDelete, setSingleStaffToDelete] = useState<Staff | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  // Fetch staff on mount or page change
  useEffect(() => {
    dispatch(fetchStaff({ pageNumber: currentPage, pageSize }));
  }, [dispatch, currentPage, pageSize]);

  // Close action dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        actionMenuRef.current &&
        !actionMenuRef.current.contains(event.target as Node)
      ) {
        setIsActionMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handlers
  const handleAddStaff = () => {
    navigate(ROUTES.STAFF_ADD);
  };

  const handleEditStaff = (id: number) => {
    navigate(ROUTES.STAFF_EDIT_PATH(id));
  };

  const handleDeleteClick = (staff: Staff) => {
    setSingleStaffToDelete(staff);
    setIsDeleteModalOpen(true);
  };

  const handleActionDeleteClick = () => {
    setIsActionMenuOpen(false);
    setSingleStaffToDelete(null);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    if (!isDeleting) {
      setIsDeleteModalOpen(false);
      setSingleStaffToDelete(null);
    }
  };

  const handleConfirmDelete = async () => {
    const idsToDelete = singleStaffToDelete
      ? [singleStaffToDelete.id]
      : selectedIds;

    if (idsToDelete.length === 0) return;

    setIsDeleting(true);
    try {
      if (idsToDelete.length === 1) {
        await dispatch(deleteStaffThunk(idsToDelete[0])).unwrap();
      } else {
        await dispatch(bulkDeleteStaffThunk(idsToDelete)).unwrap();
      }
      setIsDeleteModalOpen(false);
      setSingleStaffToDelete(null);
      dispatch(clearSelection());
      dispatch(fetchStaff({ pageNumber: currentPage, pageSize }));
    } catch {
      // Error toast is handled by thunk
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePageChange = (page: number) => {
    dispatch(setCurrentPage(page));
  };

  const handleToggleSelect = (id: number) => {
    dispatch(toggleSelectStaff(id));
  };

  const handleToggleSelectAll = () => {
    dispatch(toggleSelectAll());
  };

  const handleClearSelection = () => {
    dispatch(clearSelection());
  };

  return (
    <div className="staff-view">
      {/* View Header */}
      <div className="staff-view__header">
        <div>
          <h1 className="staff-view__title">Staff Directory</h1>
          <p className="staff-view__subtitle">
            Enterprise staff directory records, office locations, and role details.
          </p>
        </div>
        {canWriteStaff() && (
          <div className="staff-view__header-actions">
            <Button
              variant="primary"
              onClick={handleAddStaff}
              aria-label="Add new staff member"
            >
              <span aria-hidden="true">+</span> Add Staff
            </Button>
          </div>
        )}
      </div>

      {/* Selected Items Action Bar */}
      {selectedIds.length > 0 && (
        <div className="staff-view__selection-bar" role="region" aria-label="Selection actions">
          <span className="staff-view__selection-text">
            {selectedIds.length} staff member{selectedIds.length > 1 ? 's' : ''} selected
          </span>
          <div className="staff-view__selection-actions">
            {canWriteStaff() && (
              <div className="action-dropdown" ref={actionMenuRef}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsActionMenuOpen((prev) => !prev)}
                  aria-haspopup="true"
                  aria-expanded={isActionMenuOpen}
                  className="action-dropdown__trigger"
                >
                  <span>Action</span>
                  <svg
                    className={`action-dropdown__caret ${isActionMenuOpen ? 'action-dropdown__caret--open' : ''}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </Button>

                {isActionMenuOpen && (
                  <div className="action-dropdown__menu" role="menu">
                    <button
                      type="button"
                      className="action-dropdown__item action-dropdown__item--danger"
                      onClick={handleActionDeleteClick}
                      role="menuitem"
                    >
                      <svg
                        className="action-dropdown__item-icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>
            )}
            <Button variant="secondary" size="sm" onClick={handleClearSelection}>
              Clear Selection
            </Button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && !loading && (
        <ErrorMessage
          message={error}
          onRetry={() => dispatch(fetchStaff({ pageNumber: currentPage, pageSize }))}
        />
      )}

      {/* Loading Spinner */}
      {loading && !initialLoaded && (
        <div className="staff-view__loader">
          <Spinner size="lg" label="Loading staff directory..." />
        </div>
      )}

      {/* Empty State */}
      {!loading && initialLoaded && staffList.length === 0 && (
        <EmptyState
          title="No Staff Records Found"
          description="There are currently no staff records available in the directory."
          action={
            canWriteStaff() ? (
              <Button variant="primary" onClick={handleAddStaff}>
                + Add New Staff
              </Button>
            ) : undefined
          }
        />
      )}

      {/* Staff Table */}
      {staffList.length > 0 && (
        <div className="staff-view__table-container">
          <StaffTable
            staffList={staffList}
            selectedIds={selectedIds}
            isAllSelected={isAllSelected}
            isIndeterminate={isIndeterminate}
            canWrite={canWriteStaff()}
            onToggleSelect={handleToggleSelect}
            onToggleSelectAll={handleToggleSelectAll}
            onEdit={handleEditStaff}
            onDelete={handleDeleteClick}
          />

          {/* Pagination Controls (10 items per page) */}
          <div className="staff-view__pagination-wrapper">
            <Pagination
              currentPage={currentPage}
              totalCount={totalCount}
              pageSize={pageSize}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Confirm Delete"
        confirmText="Delete"
        confirmVariant="danger"
        isLoading={isDeleting}
      >
        <p>Are you sure you want to delete the selected record(s)?</p>
      </Modal>
    </div>
  );
};
