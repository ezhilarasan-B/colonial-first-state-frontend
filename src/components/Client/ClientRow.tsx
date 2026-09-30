/**
 * Client Table Row Component
 * Renders an individual client record, assigned staff badge, selection checkbox, and edit/delete actions.
 * Supports integer IDs (1, 2, 3...)
 */

import React from 'react';
import type { Client } from '../../api/client/clientTypes';
import { TableRow, TableCell, Checkbox, Button } from '../../package/UI';

export interface ClientRowProps {
  client: Client;
  isSelected: boolean;
  canWrite?: boolean;
  onToggleSelect: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (client: Client) => void;
}

export const ClientRow: React.FC<ClientRowProps> = ({
  client,
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
          onChange={() => onToggleSelect(client.id)}
          aria-label={`Select client ${client.name}`}
        />
      </TableCell>
      <TableCell>
        <div className="client-table__name-cell">
          <span className="client-table__name">{client.name}</span>
          <span className="client-table__id">ID: {client.id}</span>
        </div>
      </TableCell>
      <TableCell>{client.company}</TableCell>
      <TableCell>
        <div className="client-table__contact-cell">
          <a href={`mailto:${client.email}`} className="client-table__email">
            {client.email}
          </a>
          <span className="client-table__phone">{client.phone}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="client-table__staff-badge">
          <span className="client-table__staff-icon" aria-hidden="true">&#9679;</span>
          <span className="client-table__staff-name">
            {client.staffName ? client.staffName : `Staff #${client.staffId}`}
          </span>
        </div>
      </TableCell>
      {canWrite && (
        <TableCell align="right">
          <div className="client-table__actions">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(client.id)}
              aria-label={`Edit client ${client.name}`}
            >
              Edit
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => onDelete(client)}
              aria-label={`Delete client ${client.name}`}
            >
              Delete
            </Button>
          </div>
        </TableCell>
      )}
    </TableRow>
  );
};
