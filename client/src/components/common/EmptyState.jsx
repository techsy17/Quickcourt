import React from 'react';
import { CalendarX } from 'lucide-react';
import Button from './Button';

export const EmptyState = ({
  icon: Icon = CalendarX,
  title = 'No records found',
  description = 'There are currently no items to display.',
  actionLabel,
  onAction,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '3.5rem 1.5rem',
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px dashed var(--border-default)',
        maxWidth: '480px',
        margin: '2rem auto',
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'var(--bg-surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
          marginBottom: '1.25rem',
        }}
      >
        <Icon size={32} />
      </div>
      <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{title}</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: actionLabel ? '1.5rem' : '0' }}>
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
