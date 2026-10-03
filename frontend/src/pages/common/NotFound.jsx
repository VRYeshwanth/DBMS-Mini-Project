import React from 'react';
import { Link } from 'react-router-dom';
import { Car, ArrowLeft, Home } from 'lucide-react';

export const NotFound = () => {
  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      textAlign: 'center'
    }}>
      <div style={{ maxWidth: 480 }}>
        <div style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          backgroundColor: 'var(--primary-light)',
          color: '#8A6700',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20
        }}>
          <Car size={40} />
        </div>

        <h1 style={{ fontSize: 72, fontWeight: 800, color: 'var(--primary-dark)', margin: 0, lineHeight: 1 }}>
          404
        </h1>
        <h2 style={{ fontSize: 24, margin: '14px 0 8px' }}>Page Not Found</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 28 }}>
          The road ends here! The requested vehicle rental route or page could not be located.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Link to="/" className="btn btn-primary">
            <Home size={16} /> Return to Home
          </Link>
          <Link to="/vehicles" className="btn btn-secondary">
            Browse Vehicles
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
