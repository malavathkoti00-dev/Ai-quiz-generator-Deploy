import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  isFullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, isFullWidth = true, className = '', ...props }, ref) => {
    return (
      <div className={`form-group ${isFullWidth ? '' : ''}`}>
        {label && <label className="label">{label}</label>}
        <input
          ref={ref}
          className={`input ${error ? 'border-error' : ''} ${className}`}
          {...props}
        />
        {error && <p className="text-error text-sm mt-2">{error}</p>}
        {helperText && !error && <p className="text-muted text-sm mt-2">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
