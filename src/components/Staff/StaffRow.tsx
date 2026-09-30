/**
 * Staff Table Row Component
 * Renders an individual staff member's record, selection checkbox, and edit/delete actions.
 * Supports integer IDs (1, 2, 3...)
 */

import React from 'react';
import type { Staff } from '../../api/staff/staffTypes';
import { TableRow, TableCell, Checkbox, Button } from '../../package/UI';

export interface StaffRowProps {
  staff: Staff;
  isSelected: boolean;
  canWrite?: boolean;
  onToggleSelect: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (staff: Staff) => void;
}

export const StaffRow: React.FC<StaffRowProps> = ({
  staff,
  isSelected,
  canWrite = true,
  onToggleSelect,
  onEdit,
  onDelete,
}) => {
  return (
    <TableRow isSelected={isSelected}>
      <TableCell align="center">
        <Checkbox
          checked={isSelected}
          onChange={() => onToggleSelect(staff.id)}
          aria-label={`Select staff member ${staff.name}`}
        />
      </TableCell>
      <TableCell>
        <div className="staff-table__name-cell">
          <span className="staff-table__name">{staff.name}</span>
          <span className="staff-table__id">ID: {staff.id}</span>
        </div>
      </TableCell>
      <TableCell align="center">
        <span className="staff-table__age-badge">{staff.age} yrs</span>
      </TableCell>
      <TableCell>{staff.city}</TableCell>
      <TableCell>{staff.state}</TableCell>
      <TableCell>
        <code className="staff-table__pincode">{staff.pincode}</code>
      </TableCell>
      {canWrite && (
        <TableCell align="right">
          <div className="staff-table__actions">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(staff.id)}
              aria-label={`Edit staff member ${staff.name}`}
            >
              Edit
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => onDelete(staff)}
              aria-label={`Delete staff member ${staff.name}`}
            >
              Delete
            </Button>
          </div>
        </TableCell>
      )}
    </TableRow>
  );
};
