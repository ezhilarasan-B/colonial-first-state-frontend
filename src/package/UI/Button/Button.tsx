/**
 * Reusable Button Component
 * Generic action button with variant, size, and loading states.
 */

import React from 'react';
import './button.css';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled = false,
  className = '',
  children,
  ...rest
}) => {
  const buttonClasses = [
    'ui-btn',
    `ui-btn--${variant}`,
    `ui-btn--${size}`,
    fullWidth ? 'ui-btn--full' : '',
    isLoading ? 'ui-btn--loading' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      className={buttonClasses}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading && (
        <span className="ui-btn__spinner" aria-hidden="true" />
      )}
      {!isLoading && leftIcon && (
        <span className="ui-btn__icon ui-btn__icon--left">{leftIcon}</span>
      )}
      <span className="ui-btn__content">{children}</span>
      {!isLoading && rightIcon && (
        <span className="ui-btn__icon ui-btn__icon--right">{rightIcon}</span>
      )}
    </button>
  );
};

