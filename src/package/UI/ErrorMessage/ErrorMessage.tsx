/**
 * Reusable ErrorMessage Component
 * Generic error display with optional retry button and alert accessibility.
 */

import React from 'react';
import { Button } from '../Button';
import './errorMessage.css';

export interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryText?: string;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'Something went wrong',
  message,
  onRetry,
  retryText = 'Try Again',
  className = '',
}) => {
  return (
    <div className={`ui-error-message ${className}`} role="alert">
      <div className="ui-error-message__icon">
        <svg viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <div className="ui-error-message__body">
        <h4 className="ui-error-message__title">{title}</h4>
        <p className="ui-error-message__text">{message}</p>
        {onRetry && (
          <div className="ui-error-message__action">
            <Button variant="danger" size="sm" onClick={onRetry}>
              {retryText}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

