import React from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

export const Alert = ({ type = 'danger', message, onClose }) => {
  if (!message) return null;

  const icons = {
    danger: <AlertCircle size={20} style={{ flexShrink: 0, marginTop: 1 }} />,
    success: <CheckCircle size={20} style={{ flexShrink: 0, marginTop: 1 }} />,
    warning: <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: 1 }} />,
    info: <Info size={20} style={{ flexShrink: 0, marginTop: 1 }} />,
  };

  return (
    <div className={`alert alert-${type}`}>
      {icons[type] || icons.info}
      <div style={{ flex: 1, wordBreak: 'break-word' }}>
        {message}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            padding: 2,
            opacity: 0.7,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default Alert;
