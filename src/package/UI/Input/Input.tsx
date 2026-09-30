/**
 * Reusable Input Component
 * Generic form field with label, error display, and accessible ARIA attributes.
 */

import React, { useId } from 'react';
import './input.css';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  fullWidth = true,
  id,
  required,
  disabled,
  className = '',
  ...rest
}) => {
  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  const containerClasses = [
    'ui-input-group',
    fullWidth ? 'ui-input-group--full' : '',
    error ? 'ui-input-group--error' : '',
    disabled ? 'ui-input-group--disabled' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClasses}>
      {label && (
        <label htmlFor={inputId} className="ui-input__label">
          {label}
          {required && <span className="ui-input__required">*</span>}
        </label>
      )}

      <div className="ui-input__wrapper">
        <input
          id={inputId}
          className="ui-input__field"
          disabled={disabled}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error ? errorId : helperText ? helperId : undefined
          }
          {...rest}
        />
      </div>

      {error ? (
        <p id={errorId} className="ui-input__error" role="alert">
          {error}
        </p>
      ) : helperText ? (
        <p id={helperId} className="ui-input__helper">
          {helperText}
        </p>
      ) : null}
    </div>
  );
};

