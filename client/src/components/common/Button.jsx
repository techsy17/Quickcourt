import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  className = '',
  ...props
}) => {
  const variantClass = `qc-btn-${variant}`;
  const sizeClass = size === 'sm' ? 'qc-btn-sm' : size === 'lg' ? 'qc-btn-lg' : '';

  return (
    <button
      className={`qc-btn ${variantClass} ${sizeClass} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 size={16} className="spin-animation" style={{ animation: 'spin 1s linear infinite' }} />
          <span>Processing...</span>
        </>
      ) : (
        <>
          {Icon && <Icon size={18} />}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;
