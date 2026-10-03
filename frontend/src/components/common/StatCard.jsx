import React from 'react';

export const StatCard = ({ icon: Icon, label, value, subtext, highlight = false }) => {
  return (
    <div className={`stat-card ${highlight ? 'card-hover' : ''}`} style={highlight ? { borderColor: 'var(--primary)' } : {}}>
      {Icon && (
        <div className="stat-icon-wrapper">
          <Icon size={26} />
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
        {subtext && (
          <div style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 4 }}>
            {subtext}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
