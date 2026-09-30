/**
 * Reusable Checkbox Component
 * Supports checked, unchecked, and indeterminate visual states.
 */

import React, { useEffect, useRef, useId } from 'react';
import './checkbox.css';

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  indeterminate?: boolean;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked = false,
  indeterminate = false,
  onChange,
  label,
  disabled = false,
  id,
  className = '',
  ...rest
}) => {
  const generatedId = useId();
  const inputId = id || generatedId;
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = Boolean(indeterminate);
    }
  }, [indeterminate]);

  return (
    <label
      htmlFor={inputId}
      className={`ui-checkbox-container ${disabled ? 'ui-checkbox-container--disabled' : ''} ${className}`}
    >
      <div className="ui-checkbox-wrapper">
        <input
          ref={inputRef}
          type="checkbox"
          id={inputId}
          checked={checked}
          disabled={disabled}
          onChange={onChange}
          className="ui-checkbox__input"
          {...rest}
        />
        <div
          className={`ui-checkbox__custom ${checked ? 'ui-checkbox__custom--checked' : ''} ${indeterminate ? 'ui-checkbox__custom--indeterminate' : ''}`}
          aria-hidden="true"
        >
          {indeterminate ? (
            <svg
              className="ui-checkbox__icon"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <line x1="3" y1="8" x2="13" y2="8" />
            </svg>
          ) : checked ? (
            <svg
              className="ui-checkbox__icon"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 8 6.5 11.5 13 4.5" />
            </svg>
          ) : null}
        </div>
      </div>
      {label && <span className="ui-checkbox__label">{label}</span>}
    </label>
  );
};

