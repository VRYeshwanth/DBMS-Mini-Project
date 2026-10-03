import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import { Car, Heart, ShieldCheck, Clock, Award } from 'lucide-react';

export const CustomerLayout = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      {/* Polished University DBMS Project Footer */}
      <footer style={{
        backgroundColor: '#181818',
        color: '#A3A3A3',
        borderTop: '1px solid #2B2B2B',
        padding: '50px 0 25px',
        marginTop: '60px'
      }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 40,
            marginBottom: 40
          }}>
            {/* Brand column */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{
                  width: 34,
                  height: 34,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--primary)',
                  color: '#181818',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Car size={20} strokeWidth={2.2} />
                </div>
                <span style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 800,
                  fontSize: 18,
                  color: '#FFFFFF'
                }}>
                  VELOCITY RENTALS
                </span>
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.6, color: '#888888', marginBottom: 16 }}>
                Premium vehicle rental management system featuring transparent booking, instant payments, and enterprise fleet tracking.
              </p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--primary)', fontWeight: 600 }}>
                <Award size={14} /> University DBMS Mini-Project
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 style={{ color: '#FFFFFF', fontSize: 15, marginBottom: 16, fontWeight: 600 }}>
                Quick Navigation
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                <li><Link to="/" style={{ color: '#A3A3A3', transition: 'color 0.2s' }}>Home</Link></li>
                <li><Link to="/vehicles" style={{ color: '#A3A3A3', transition: 'color 0.2s' }}>Browse Available Vehicles</Link></li>
                <li><Link to="/my-rentals" style={{ color: '#A3A3A3', transition: 'color 0.2s' }}>My Rental History</Link></li>
                <li><Link to="/profile" style={{ color: '#A3A3A3', transition: 'color 0.2s' }}>Customer Profile</Link></li>
              </ul>
            </div>

            {/* Fleet Types */}
            <div>
              <h4 style={{ color: '#FFFFFF', fontSize: 15, marginBottom: 16, fontWeight: 600 }}>
                Vehicle Categories
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                <li><span style={{ color: '#A3A3A3' }}>Luxury & Family SUVs (Fortuner, Innova)</span></li>
                <li><span style={{ color: '#A3A3A3' }}>Executive Sedans (City, Verna)</span></li>
                <li><span style={{ color: '#A3A3A3' }}>Urban Hatchbacks (i20, Swift)</span></li>
                <li><span style={{ color: '#A3A3A3' }}>Full Insurance & Zero Security Hassle</span></li>
              </ul>
            </div>

            {/* Project Specifications */}
            <div>
              <h4 style={{ color: '#FFFFFF', fontSize: 15, marginBottom: 16, fontWeight: 600 }}>
                Database Tech
              </h4>
              <p style={{ fontSize: 13, lineHeight: 1.6, color: '#888888', marginBottom: 12 }}>
                Normalized MySQL Schema (BCNF), JWT Auth, Referential Integrity, Transactions, and Event Scheduling.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: '#999' }}>
                <div>Backend: Node.js &bull; Express.js</div>
                <div>Frontend: React &bull; React Router &bull; Axios</div>
                <div>Database: MySQL2 Connection Pool</div>
              </div>
            </div>
          </div>

          <div style={{
            borderTop: '1px solid #2B2B2B',
            paddingTop: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            fontSize: 12,
            color: '#777777'
          }}>
            <div>
              &copy; {new Date().getFullYear()} Vehicle Rental Management System. All rights reserved.
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              Built with precision for DBMS Mini-Project
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CustomerLayout;
