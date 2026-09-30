/**
 * Client List Component
 * Displays client directory table, pagination (10 items per page),
 * assigned staff metadata, action bar with '+ Add Client', Action dropdown menu,
 * and delete confirmation modal.
 * Supports integer IDs (1, 2, 3...)
 */

import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  fetchClients,
  deleteClientThunk,
  bulkDeleteClientsThunk,
  toggleSelectClient,
  toggleSelectAll,
  clearSelection,
  setCurrentPage,
  selectClients,
  selectClientTotalCount,
  selectClientCurrentPage,
  selectClientPageSize,
  selectClientLoading,
  selectClientError,
  selectClientInitialLoaded,
  selectSelectedClientIds,
  selectIsAllClientsSelected,
  selectIsClientIndeterminate,
} from '../../api/client/clientSlice';
import type { Client } from '../../api/client/clientTypes';
import { canWriteClient } from '../../api/common/tokenHelper';
import { ROUTES } from '../../constants';
import { Button, Modal, Spinner, EmptyState, ErrorMessage, Pagination } from '../../package/UI';
import { ClientTable } from './ClientTable';
import './client.css';

export const ClientList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const clientList = useAppSelector(selectClients);
  const totalCount = useAppSelector(selectClientTotalCount);
  const currentPage = useAppSelector(selectClientCurrentPage);
  const pageSize = useAppSelector(selectClientPageSize);
  const loading = useAppSelector(selectClientLoading);
  const error = useAppSelector(selectClientError);
  const initialLoaded = useAppSelector(selectClientInitialLoaded);
  const selectedIds = useAppSelector(selectSelectedClientIds);
  const isAllSelected = useAppSelector(selectIsAllClientsSelected);
  const isIndeterminate = useAppSelector(selectIsClientIndeterminate);

  // Delete modal & action menu state
  const [singleClientToDelete, setSingleClientToDelete] = useState<Client | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  // Fetch clients on mount or page change
  useEffect(() => {
    dispatch(fetchClients({ pageNumber: currentPage, pageSize }));
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
  const handleAddClient = () => {
    navigate(ROUTES.CLIENT_ADD);
  };

  const handleEditClient = (id: number) => {
    navigate(ROUTES.CLIENT_EDIT_PATH(id));
  };

  const handleDeleteClick = (client: Client) => {
    setSingleClientToDelete(client);
    setIsDeleteModalOpen(true);
  };

  const handleActionDeleteClick = () => {
    setIsActionMenuOpen(false);
    setSingleClientToDelete(null);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    if (!isDeleting) {
      setIsDeleteModalOpen(false);
      setSingleClientToDelete(null);
    }
  };

  const handleConfirmDelete = async () => {
    const idsToDelete = singleClientToDelete
      ? [singleClientToDelete.id]
      : selectedIds;

    if (idsToDelete.length === 0) return;

    setIsDeleting(true);
    try {
      if (idsToDelete.length === 1) {
        await dispatch(deleteClientThunk(idsToDelete[0])).unwrap();
      } else {
        await dispatch(bulkDeleteClientsThunk(idsToDelete)).unwrap();
      }
      setIsDeleteModalOpen(false);
      setSingleClientToDelete(null);
      dispatch(clearSelection());
      dispatch(fetchClients({ pageNumber: currentPage, pageSize }));
    } catch {
      // Error handled via toast in thunk
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePageChange = (page: number) => {
    dispatch(setCurrentPage(page));
  };

  const handleToggleSelect = (id: number) => {
    dispatch(toggleSelectClient(id));
  };

  const handleToggleSelectAll = () => {
    dispatch(toggleSelectAll());
  };

  const handleClearSelection = () => {
    dispatch(clearSelection());
  };

  return (
    <div className="client-view">
      {/* View Header */}
      <div className="client-view__header">
        <div>
          <h1 className="client-view__title">Client Management</h1>
          <p className="client-view__subtitle">
            Manage corporate client accounts, affiliations, and assigned staff relationships.
          </p>
        </div>
        {canWriteClient() && (
          <div className="client-view__header-actions">
            <Button
              variant="primary"
              onClick={handleAddClient}
              aria-label="Add new client"
            >
              <span aria-hidden="true">+</span> Add Client
            </Button>
          </div>
        )}
      </div>

      {/* Selected Items Action Bar */}
      {selectedIds.length > 0 && (
        <div className="client-view__selection-bar" role="region" aria-label="Selection actions">
          <span className="client-view__selection-text">
            {selectedIds.length} client{selectedIds.length > 1 ? 's' : ''} selected
          </span>
          <div className="client-view__selection-actions">
            {canWriteClient() && (
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
          onRetry={() => dispatch(fetchClients({ pageNumber: currentPage, pageSize }))}
        />
      )}

      {/* Loading Spinner */}
      {loading && !initialLoaded && (
        <div className="client-view__loader">
          <Spinner size="lg" label="Loading client accounts..." />
        </div>
      )}

      {/* Empty State */}
      {!loading && initialLoaded && clientList.length === 0 && (
        <EmptyState
          title="No Client Accounts Found"
          description="There are currently no clients registered in the system."
          action={
            canWriteClient() ? (
              <Button variant="primary" onClick={handleAddClient}>
                + Add New Client
              </Button>
            ) : undefined
          }
        />
      )}

      {/* Client Table */}
      {clientList.length > 0 && (
        <div className="client-view__table-container">
          <ClientTable
            clientList={clientList}
            selectedIds={selectedIds}
            isAllSelected={isAllSelected}
            isIndeterminate={isIndeterminate}
            canWrite={canWriteClient()}
            onToggleSelect={handleToggleSelect}
            onToggleSelectAll={handleToggleSelectAll}
            onEdit={handleEditClient}
            onDelete={handleDeleteClick}
          />

          {/* Pagination Controls (10 items per page) */}
          <div className="client-view__pagination-wrapper">
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
