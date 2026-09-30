/**
 * Reusable Table Component System
 * Generic accessible table primitives supporting responsive horizontal scrolling.
 */

import React from 'react';
import './table.css';

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
  wrapperClassName?: string;
}

export const Table: React.FC<TableProps> = ({
  children,
  className = '',
  wrapperClassName = '',
  ...rest
}) => {
  return (
    <div className={`ui-table-container ${wrapperClassName}`}>
      <table className={`ui-table ${className}`} {...rest}>
        {children}
      </table>
    </div>
  );
};

export interface TableHeaderProps
  extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

export const TableHeader: React.FC<TableHeaderProps> = ({
  children,
  className = '',
  ...rest
}) => {
  return (
    <thead className={`ui-table__head ${className}`} {...rest}>
      {children}
    </thead>
  );
};

export interface TableBodyProps
  extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

export const TableBody: React.FC<TableBodyProps> = ({
  children,
  className = '',
  ...rest
}) => {
  return (
    <tbody className={`ui-table__body ${className}`} {...rest}>
      {children}
    </tbody>
  );
};

export interface TableRowProps
  extends React.HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode;
  isSelected?: boolean;
}

export const TableRow: React.FC<TableRowProps> = ({
  children,
  isSelected = false,
  className = '',
  ...rest
}) => {
  return (
    <tr
      className={`ui-table__row ${isSelected ? 'ui-table__row--selected' : ''} ${className}`}
      {...rest}
    >
      {children}
    </tr>
  );
};

export interface TableHeadCellProps
  extends React.ThHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right';
}

export const TableHeadCell: React.FC<TableHeadCellProps> = ({
  children,
  align = 'left',
  className = '',
  ...rest
}) => {
  return (
    <th
      className={`ui-table__th ui-table__th--${align} ${className}`}
      {...rest}
    >
      {children}
    </th>
  );
};

export interface TableCellProps
  extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right';
}

export const TableCell: React.FC<TableCellProps> = ({
  children,
  align = 'left',
  className = '',
  ...rest
}) => {
  return (
    <td
      className={`ui-table__td ui-table__td--${align} ${className}`}
      {...rest}
    >
      {children}
    </td>
  );
};

