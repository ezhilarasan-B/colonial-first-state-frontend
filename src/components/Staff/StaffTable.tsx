/**
 * Staff Table Component
 * Coordinates table headers, Select All checkbox with indeterminate state,
 * and individual staff rows.
 * Supports integer IDs (1, 2, 3...)
 */

import React from 'react';
import type { Staff } from '../../api/staff/staffTypes';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHeadCell,
  Checkbox,
} from '../../package/UI';
import { StaffRow } from './StaffRow';

export interface StaffTableProps {
  staffList: Staff[];
  selectedIds: number[];
  isAllSelected: boolean;
  isIndeterminate: boolean;
  canWrite?: boolean;
  onToggleSelect: (id: number) => void;
  onToggleSelectAll: () => void;
  onEdit: (id: number) => void;
  onDelete: (staff: Staff) => void;
}

export const StaffTable: React.FC<StaffTableProps> = ({
  staffList,
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
    <Table className="staff-table">
      <TableHeader>
        <TableRow>
          <TableHeadCell align="center" style={{ width: '48px' }}>
            <Checkbox
              checked={isAllSelected}
              indeterminate={isIndeterminate}
              onChange={onToggleSelectAll}
              aria-label="Select all staff members"
            />
          </TableHeadCell>
          <TableHeadCell>Name</TableHeadCell>
          <TableHeadCell align="center" style={{ width: '90px' }}>
            Age
          </TableHeadCell>
          <TableHeadCell>City</TableHeadCell>
          <TableHeadCell>State</TableHeadCell>
          <TableHeadCell style={{ width: '120px' }}>Pincode</TableHeadCell>
          {canWrite && (
            <TableHeadCell align="right" style={{ width: '160px' }}>
              Actions
            </TableHeadCell>
          )}
        </TableRow>
      </TableHeader>

      <TableBody>
        {staffList.map((staff) => (
          <StaffRow
            key={staff.id}
            staff={staff}
            isSelected={selectedIds.includes(staff.id)}
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
