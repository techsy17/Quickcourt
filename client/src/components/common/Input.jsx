import React from 'react';

export const Input = ({
  label,
  error,
  icon: Icon,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || props.name || Math.random().toString(36).substring(2, 7);

  return (
    <div className={`qc-form-group ${className}`}>
      {label && (
        <label htmlFor={inputId} className="qc-label">
          {label}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {Icon && (
          <div
            style={{
              position: 'absolute',
              left: '12px',
              color: '#64748B',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Icon size={18} />
          </div>
        )}
        <input
          id={inputId}
          className="qc-input"
          style={{
            paddingLeft: Icon ? '40px' : '14px',
            borderColor: error ? 'var(--status-danger)' : undefined,
          }}
          {...props}
        />
      </div>
      {error && <span className="qc-error-text">{error}</span>}
    </div>
  );
};

export default Input;
