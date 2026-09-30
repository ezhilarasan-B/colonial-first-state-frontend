/**
 * Reusable Spinner Component
 * Generic loading indicator for async operations.
 */

import React from 'react';
import './spinner.css';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  label = 'Loading...',
  className = '',
}) => {
  return (
    <div
      className={`ui-spinner-wrapper ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className={`ui-spinner ui-spinner--${size}`} aria-hidden="true" />
      {label && <span className="ui-spinner__label">{label}</span>}
    </div>
  );
};

