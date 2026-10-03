import React, { useState } from 'react';
import { Outlet, Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Sidebar from '../components/common/Sidebar';
import { Menu, Shield, ExternalLink, User } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';

export const AdminLayout = () => {
  const { user, isAuthenticated, isAdmin, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner message="Authenticating administrator session..." />;
  }

  // Enforce Admin role restriction
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Get current section name
  const pathParts = location.pathname.split('/').filter(Boolean);
  const sectionTitle = pathParts[1]
    ? pathParts[1].charAt(0).toUpperCase() + pathParts[1].slice(1)
    : 'Dashboard';

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="admin-main">
        {/* Topbar */}
        <header className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              onClick={() => setSidebarOpen(true)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                padding: 6,
                borderRadius: 'var(--radius-sm)'
              }}
              className="admin-mobile-toggle"
              aria-label="Open sidebar menu"
            >
              <Menu size={22} />
            </button>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
                {sectionTitle}
              </h2>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Link
              to="/"
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <ExternalLink size={14} />
              <span className="hide-on-mobile">Customer View</span>
            </Link>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '5px 12px',
              backgroundColor: 'var(--bg-muted)',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-color)',
              fontSize: 13
            }}>
              <div style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                backgroundColor: 'var(--primary)',
                color: '#181818',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700
              }}>
                <Shield size={14} />
              </div>
              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                Admin
              </span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="admin-content">
          <Outlet />
        </div>
      </div>

      <style>{`
        @media (min-width: 901px) {
          .admin-mobile-toggle {
            display: none !important;
          }
        }
        @media (max-width: 640px) {
          .hide-on-mobile {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;
