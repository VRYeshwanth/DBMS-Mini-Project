import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import vehicleService from '../../services/vehicleService';
import customerService from '../../services/customerService';
import VehicleCard from '../../components/vehicles/VehicleCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDate, formatCurrency } from '../../utils/formatters';
import {
  Car,
  KeyRound,
  ShieldCheck,
  ArrowRight,
  Clock,
  MapPin,
  Calendar,
  Sparkles,
  ChevronRight,
  CreditCard
} from 'lucide-react';

export const CustomerDashboard = () => {
  const { user, isAuthenticated, isCustomer } = useAuth();

  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch available vehicles
        const vehRes = await vehicleService.getAvailableVehicles();
        if (vehRes && vehRes.data) {
          setAvailableVehicles(vehRes.data);
        }

        // If authenticated customer, fetch their rentals
        if (isAuthenticated && isCustomer) {
          try {
            const rentalRes = await customerService.getMyRentals();
            if (rentalRes && rentalRes.data) {
              setRentals(rentalRes.data);
            }
          } catch (err) {
            console.warn('Could not fetch user rentals:', err.message);
          }
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Failed to load vehicle catalog. Please ensure the backend is running.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [isAuthenticated, isCustomer]);

  // Derive stats from customer rentals
  const activeRentals = rentals.filter((r) => r.status === 'Active');
  const completedRentals = rentals.filter((r) => r.status === 'Completed');
  const primaryActiveRental = activeRentals[0];

  return (
    <div className="container" style={{ paddingTop: 36, paddingBottom: 48 }}>
      {error && <Alert type="danger" message={error} />}

      {/* Hero Welcome Banner */}
      <section style={{
        background: 'linear-gradient(135deg, #181818 0%, #282828 100%)',
        borderRadius: 'var(--radius-xl)',
        padding: '48px 40px',
        color: '#FFFFFF',
        marginBottom: 36,
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid #333'
      }}>
        {/* Subtle decorative yellow glow */}
        <div style={{
          position: 'absolute',
          top: -60,
          right: -60,
          width: 260,
          height: 260,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245, 197, 24, 0.25) 0%, rgba(245, 197, 24, 0) 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: 640, position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            backgroundColor: 'rgba(245, 197, 24, 0.15)',
            border: '1px solid rgba(245, 197, 24, 0.3)',
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            fontSize: 13,
            color: 'var(--primary)',
            fontWeight: 600,
            marginBottom: 16
          }}>
            <Sparkles size={15} />
            DBMS University Mini-Project
          </div>

          <h1 style={{
            fontSize: 36,
            color: '#FFFFFF',
            lineHeight: 1.2,
            marginBottom: 14,
            fontWeight: 800
          }}>
            {isAuthenticated
              ? `Welcome, ${user?.name || user?.email?.split('@')[0]}!`
              : 'Hit the Road with Premium Rentals'}
          </h1>

          <p style={{ fontSize: 16, color: '#D4D4D4', lineHeight: 1.6, marginBottom: 28 }}>
            Experience hassle-free vehicle rentals backed by a robust database architecture.
            Instant reservations, zero hidden fees, and transparent pricing.
          </p>

          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <Link to="/vehicles" className="btn btn-primary btn-lg">
              <span>Explore Fleet</span>
              <ArrowRight size={18} />
            </Link>

            {isAuthenticated ? (
              <Link to="/my-rentals" className="btn btn-secondary btn-lg" style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: '#FFFFFF', borderColor: '#444' }}>
                <KeyRound size={18} />
                <span>My Bookings</span>
              </Link>
            ) : (
              <Link to="/register" className="btn btn-secondary btn-lg" style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: '#FFFFFF', borderColor: '#444' }}>
                <span>Create Free Account</span>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Customer Quick Stats Summary (if authenticated) */}
      {isAuthenticated && isCustomer && (
        <section style={{ marginBottom: 36 }}>
          <div className="grid-3">
            <div className="stat-card">
              <div className="stat-icon-wrapper" style={{ backgroundColor: '#DCFCE7', color: '#16A34A' }}>
                <KeyRound size={24} />
              </div>
              <div>
                <div className="stat-value">{activeRentals.length}</div>
                <div className="stat-label">Active Bookings</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper">
                <Clock size={24} />
              </div>
              <div>
                <div className="stat-value">{completedRentals.length}</div>
                <div className="stat-label">Completed Trips</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper" style={{ backgroundColor: '#EFF6FF', color: '#2563EB' }}>
                <Car size={24} />
              </div>
              <div>
                <div className="stat-value">{availableVehicles.length}</div>
                <div className="stat-label">Available in Fleet</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Active Rental Spotlight Card (if customer has active rental) */}
      {primaryActiveRental && (
        <section style={{ marginBottom: 36 }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-xl)',
            padding: '24px 28px',
            border: '2px solid var(--primary)',
            boxShadow: 'var(--shadow-yellow)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 20
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 54,
                height: 54,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary)',
                color: '#181818',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <KeyRound size={28} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#8A6700', textTransform: 'uppercase' }}>
                    Current Active Rental
                  </span>
                  <StatusBadge status={primaryActiveRental.status} />
                  {primaryActiveRental.payment_status ? (
                    <StatusBadge status={primaryActiveRental.payment_status} />
                  ) : (
                    <span className="badge badge-warning">Payment Pending</span>
                  )}
                </div>
                <h3 style={{ fontSize: 20, margin: 0 }}>
                  {primaryActiveRental.make} {primaryActiveRental.model} ({primaryActiveRental.plate_number})
                </h3>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  fontSize: 13,
                  color: 'var(--text-muted)',
                  marginTop: 6,
                  flexWrap: 'wrap'
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Calendar size={14} />
                    {formatDate(primaryActiveRental.start_date)} &rarr; {formatDate(primaryActiveRental.end_date)}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <MapPin size={14} />
                    Pickup: {primaryActiveRental.pickup_loc}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              {!primaryActiveRental.payment_status && (
                <Link
                  to={`/payment/${primaryActiveRental.rental_id}`}
                  className="btn btn-primary"
                >
                  <CreditCard size={16} /> Pay Now
                </Link>
              )}
              <Link to="/my-rentals" className="btn btn-secondary">
                View All Rentals &rarr;
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Featured Fleet Section */}
      <section style={{ marginTop: 24 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 24
        }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 800 }}>Available Vehicles</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
              Ready for immediate booking with verified mechanical condition
            </p>
          </div>
          <Link
            to="/vehicles"
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <span>View All ({availableVehicles.length})</span>
            <ChevronRight size={16} />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading available fleet..." />
        ) : availableVehicles.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 48 }}>
            <Car size={48} color="#999" style={{ margin: '0 auto 12px' }} />
            <h3>No vehicles currently available</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
              All vehicles are currently on active rentals or undergoing routine maintenance.
            </p>
          </div>
        ) : (
          <div className="grid-3">
            {availableVehicles.slice(0, 3).map((vehicle) => (
              <VehicleCard key={vehicle.plate_number} vehicle={vehicle} />
            ))}
          </div>
        )}
      </section>

      {/* Why Choose Us / Trust Badges */}
      <section style={{ marginTop: 60 }}>
        <div className="grid-3">
          <div className="card" style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--primary-light)',
              color: '#8A6700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: 16, marginBottom: 4 }}>Routine Inspection</h4>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Our database automatically enforces preventive maintenance tracking before any vehicle hits the road.
              </p>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--primary-light)',
              color: '#8A6700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Clock size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: 16, marginBottom: 4 }}>Auto-Scheduling</h4>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                MySQL Event Scheduler monitors rental periods and automatically transitions completed reservations.
              </p>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--primary-light)',
              color: '#8A6700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <CreditCard size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: 16, marginBottom: 4 }}>Multi-Payment Support</h4>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Pay seamlessly with instant UPI, Credit/Debit Cards, or flexible Cash settlements upon pickup.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CustomerDashboard;
