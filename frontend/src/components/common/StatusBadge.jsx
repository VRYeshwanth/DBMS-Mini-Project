import React from 'react';

export const StatusBadge = ({ status, type = 'status' }) => {
  if (!status) return null;

  const normalized = String(status).toLowerCase();

  let badgeClass = 'badge-completed';
  let label = status;

  if (normalized === 'active') {
    badgeClass = 'badge-active';
  } else if (normalized === 'completed') {
    badgeClass = 'badge-completed';
  } else if (normalized === 'paid') {
    badgeClass = 'badge-active';
  } else if (normalized === 'admin') {
    badgeClass = 'badge-yellow';
    label = 'ADMIN';
  } else if (normalized === 'customer') {
    badgeClass = 'badge-completed';
    label = 'CUSTOMER';
  } else if (normalized === 'card' || normalized === 'upi' || normalized === 'cash') {
    badgeClass = 'badge-yellow';
  }

  return (
    <span className={`badge ${badgeClass}`}>
      <span style={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        backgroundColor: 'currentColor',
        display: 'inline-block'
      }}></span>
      {label}
    </span>
  );
};

export default StatusBadge;
