/**
 * Client Table Component
 * Coordinates table headers, Select All checkbox with indeterminate state,
 * and individual client rows.
 * Supports integer IDs (1, 2, 3...)
 */

import React from 'react';
import type { Client } from '../../api/client/clientTypes';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHeadCell,
  Checkbox,
} from '../../package/UI';
import { ClientRow } from './ClientRow';

export interface ClientTableProps {
  clientList: Client[];
  selectedIds: number[];
  isAllSelected: boolean;
  isIndeterminate: boolean;
  canWrite?: boolean;
  onToggleSelect: (id: number) => void;
  onToggleSelectAll: () => void;
  onEdit: (id: number) => void;
  onDelete: (client: Client) => void;
}

export const ClientTable: React.FC<ClientTableProps> = ({
  clientList,
  selectedIds,
  isAllSelected,
  isIndeterminate,
  canWrite = true,
  onToggleSelect,
  onToggleSelectAll,
  onEdit,
  onDelete,
}) => {
  return (
    <Table className="client-table">
      <TableHeader>
        <TableRow>
          <TableHeadCell align="center" style={{ width: '48px' }}>
            <Checkbox
              checked={isAllSelected}
              indeterminate={isIndeterminate}
              onChange={onToggleSelectAll}
              aria-label="Select all clients"
            />
          </TableHeadCell>
          <TableHeadCell>Client Name</TableHeadCell>
          <TableHeadCell>Company</TableHeadCell>
          <TableHeadCell>Contact Info</TableHeadCell>
          <TableHeadCell>Assigned Staff</TableHeadCell>
          {canWrite && (
            <TableHeadCell align="right" style={{ width: '160px' }}>
              Actions
            </TableHeadCell>
          )}
        </TableRow>
      </TableHeader>

      <TableBody>
        {clientList.map((client) => (
          <ClientRow
            key={client.id}
            client={client}
            isSelected={selectedIds.includes(client.id)}
            canWrite={canWrite}
            onToggleSelect={onToggleSelect}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </TableBody>
    </Table>
  );
};
