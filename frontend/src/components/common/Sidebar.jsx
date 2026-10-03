import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  Car,
  KeyRound,
  Users,
  CreditCard,
  Wrench,
  Building2,
  LogOut,
  ExternalLink,
  X,
  ShieldAlert
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, end: true },
    { label: 'Vehicles', path: '/admin/vehicles', icon: Car },
    { label: 'Rentals', path: '/admin/rentals', icon: KeyRound },
    { label: 'Customers', path: '/admin/customers', icon: Users },
    { label: 'Payments', path: '/admin/payments', icon: CreditCard },
    { label: 'Maintenance', path: '/admin/maintenance', icon: Wrench },
    { label: 'Branches', path: '/admin/branches', icon: Building2 },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            zIndex: 89,
            display: 'block'
          }}
          className="admin-backdrop"
        />
      )}

      <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="admin-sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--primary)',
              color: '#181818',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800
            }}>
              VR
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: '#FFFFFF', letterSpacing: -0.3 }}>
                VELOCITY
              </div>
              <div style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 600, letterSpacing: 1 }}>
                ADMIN PANEL
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#888',
              cursor: 'pointer',
              display: 'flex',
              padding: 4
            }}
            className="mobile-close-btn"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="admin-nav">
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#666', padding: '8px 12px 4px' }}>
            Menu
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          <div style={{ borderTop: '1px solid #262626', margin: '16px 0 8px' }} />

          <Link
            to="/"
            className="admin-nav-item"
            style={{ color: '#888' }}
          >
            <ExternalLink size={18} />
            <span>Customer Website</span>
          </Link>
        </nav>

        {/* Sidebar Footer with current user & logout */}
        <div style={{
          padding: '16px',
          borderTop: '1px solid #2A2A2A',
          backgroundColor: '#121212'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#FFFFFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.email}
              </div>
              <div style={{ fontSize: 11, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                <ShieldAlert size={12} />
                Administrator
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', justifyContent: 'center', backgroundColor: '#222', color: '#FFF', borderColor: '#333' }}
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <style>{`
        @media (min-width: 901px) {
          .mobile-close-btn, .admin-backdrop {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
};

export default Sidebar;
