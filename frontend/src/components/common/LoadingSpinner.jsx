import React from 'react';

export const LoadingSpinner = ({ message = 'Loading...', size = 'default' }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      gap: 16
    }}>
      <div className={`spinner ${size === 'small' ? 'spinner-sm' : ''}`}></div>
      {message && (
        <p style={{
          color: 'var(--text-muted)',
          fontSize: 14,
          fontWeight: 500
        }}>
          {message}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
