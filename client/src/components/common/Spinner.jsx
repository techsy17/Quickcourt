import React from 'react';
import { Loader2 } from 'lucide-react';

export const Spinner = ({ size = 32, message = 'Loading...', fullScreen = false }) => {
  const content = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        padding: '2rem',
      }}
    >
      <Loader2
        size={size}
        color="var(--primary)"
        style={{ animation: 'spin 1s linear infinite' }}
      />
      {message && (
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>
          {message}
        </span>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {content}
      </div>
    );
  }

  return content;
};

export default Spinner;
