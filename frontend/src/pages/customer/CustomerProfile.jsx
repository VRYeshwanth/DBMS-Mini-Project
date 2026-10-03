import React, { useState, useEffect } from 'react';
import authService from '../../services/authService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDate, formatDateTime } from '../../utils/formatters';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShieldCheck,
  Clock,
  IdCard,
  KeyRound
} from 'lucide-react';

export const CustomerProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await authService.getCurrentUser();
        if (res && res.data) {
          setProfile(res.data);
        } else {
          setError('Could not retrieve profile information.');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err?.response?.data?.message || 'Failed to fetch user profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading customer account details..." />;
  }

  if (error || !profile) {
    return (
      <div className="container" style={{ padding: '60px 20px', maxWidth: 600 }}>
        <Alert type="danger" message={error || 'Profile not found.'} />
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: 36, paddingBottom: 60, maxWidth: 840 }}>
      {/* Title */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 32, marginBottom: 8 }}>Customer Profile</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
          Your verified account credentials and personal details retrieved from the database
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Top Profile Header Card */}
        <div className="card" style={{
          padding: 28,
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          gap: 24,
          flexWrap: 'wrap'
        }}>
          <div style={{
            width: 72,
            height: 72,
            borderRadius: 'var(--radius-xl)',
            backgroundColor: 'var(--primary)',
            color: '#181818',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
            fontWeight: 800,
            boxShadow: 'var(--shadow-yellow)'
          }}>
            {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
          </div>

          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <h2 style={{ fontSize: 22, margin: 0 }}>{profile.name || 'Registered Customer'}</h2>
              <StatusBadge status={profile.role} />
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Mail size={15} /> {profile.email}
            </div>
          </div>

          <div style={{
            backgroundColor: 'var(--bg-muted)',
            padding: '10px 16px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            fontSize: 12,
            display: 'flex',
            flexDirection: 'column',
            gap: 4
          }}>
            <div>Customer ID: <strong>{profile.customer_id || '—'}</strong></div>
            <div>User ID: <strong>{profile.user_id}</strong></div>
          </div>
        </div>

        {/* Detailed Information Grid */}
        <div className="card">
          <h3 style={{ fontSize: 18, marginBottom: 20, borderBottom: '1px solid var(--border-color)', paddingBottom: 12 }}>
            Personal & Contact Information
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 24
          }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                <User size={14} /> Full Name
              </div>
              <div style={{ fontSize: 16, fontWeight: 600, marginTop: 4 }}>
                {profile.name || '—'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Mail size={14} /> Email Address
              </div>
              <div style={{ fontSize: 16, fontWeight: 600, marginTop: 4 }}>
                {profile.email || '—'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Phone size={14} /> Contact Phone
              </div>
              <div style={{ fontSize: 16, fontWeight: 600, marginTop: 4 }}>
                {profile.phone || 'Not provided'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Calendar size={14} /> Date of Birth
              </div>
              <div style={{ fontSize: 16, fontWeight: 600, marginTop: 4 }}>
                {formatDate(profile.dob)}
              </div>
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                <MapPin size={14} /> Residential / Billing Address
              </div>
              <div style={{ fontSize: 16, fontWeight: 600, marginTop: 4 }}>
                {profile.address || 'Not provided'}
              </div>
            </div>
          </div>
        </div>

        {/* Database & Account Meta */}
        <div className="card">
          <h3 style={{ fontSize: 18, marginBottom: 20, borderBottom: '1px solid var(--border-color)', paddingBottom: 12 }}>
            Account & Security Credentials
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 24
          }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Assigned Role
              </div>
              <div style={{ marginTop: 6 }}>
                <StatusBadge status={profile.role} />
              </div>
            </div>

            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock size={14} /> Member Since
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, marginTop: 4 }}>
                {formatDateTime(profile.created_at)}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Authentication Type
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                <ShieldCheck size={16} color="#16A34A" /> JWT Token Authenticated
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;
